# Stripe Payment Integration for EvolvIQ
# Handles subscriptions, webhooks, and customer management

import stripe
import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from fastapi import HTTPException
from firebase_admin import firestore
import firebase_admin
from firebase_admin import credentials

# Configure logging
logger = logging.getLogger(__name__)

class StripeIntegration:
    """
    Comprehensive Stripe integration for subscription management
    """
    
    def __init__(self):
        # Initialize Stripe with API key
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        if not stripe.api_key:
            logger.warning("STRIPE_SECRET_KEY environment variable is not set - Stripe integration will be disabled")
            raise ValueError("STRIPE_SECRET_KEY environment variable is required")
        
        # Webhook endpoint secret for verification
        self.webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        if not self.webhook_secret:
            logger.warning("STRIPE_WEBHOOK_SECRET environment variable is not set - webhook verification will be disabled")
        
        # Initialize Firebase Admin (if not already initialized)
        try:
            firebase_admin.get_app()
        except ValueError:
            # Initialize Firebase Admin with service account
            firebase_service_account = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
            if firebase_service_account:
                cred = credentials.Certificate(json.loads(firebase_service_account))
                firebase_admin.initialize_app(cred)
        
        self.db = None
        
        # Price mapping from your config
        self.price_mapping = {
            'monthly': os.getenv('STRIPE_PRICE_MONTHLY'),  # Will be set after Stripe setup
            'annual': os.getenv('STRIPE_PRICE_ANNUAL'),
            'business': os.getenv('STRIPE_PRICE_BUSINESS')
        }
        
        logger.info(f"StripeIntegration initialized successfully with price mapping: {list(self.price_mapping.keys())}")
    
    def get_db(self):
        if self.db is None:
            try:
                self.db = firestore.client()
                logger.info("✅ Firestore client initialized for Stripe integration")
            except Exception as e:
                logger.error(f"Failed to initialize Firestore: {e}")
                logger.error(f"Error type: {type(e).__name__}")
                import traceback
                logger.error(f"Traceback: {traceback.format_exc()}")
                raise  # Re-raise to see the actual error
        return self.db

    async def create_customer(self, user_id: str, email: str, name: str = None) -> str:
        """
        Create a Stripe customer for a user
        """
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata={
                    'firebase_uid': user_id,
                    'source': 'evolviq_web'
                }
            )
            
            # Update user document with Stripe customer ID
            db = self.get_db()
            if db:
                user_ref = db.collection('users').document(user_id)
                user_ref.update({
                    'stripe_customer_id': customer.id,
                    'updated_at': datetime.utcnow()
                })
            else:
                logger.error("Failed to get Firestore client in create_customer")
            
            logger.info(f"Created Stripe customer {customer.id} for user {user_id}")
            return customer.id
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating customer: {e}")
            raise HTTPException(status_code=400, detail=f"Payment error: {str(e)}")
        except Exception as e:
            logger.error(f"Error creating customer: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    async def get_or_create_customer(self, user_id: str, email: str, name: str = None) -> str:
        """
        Get existing Stripe customer or create new one
        """
        try:
            # Check if user already has a Stripe customer ID
            db = self.get_db()
            if not db:
                logger.error("Failed to get Firestore client in get_or_create_customer")
                raise HTTPException(status_code=500, detail="Database connection error")
            
            user_ref = db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                if 'stripe_customer_id' in user_data:
                    # Verify customer still exists in Stripe
                    try:
                        customer = stripe.Customer.retrieve(user_data['stripe_customer_id'])
                        if customer.deleted:
                            logger.info(f"Customer {user_data['stripe_customer_id']} is deleted, creating new one")
                            # Clear the old customer ID from Firebase
                            user_ref.update({'stripe_customer_id': firestore.DELETE_FIELD})
                        else:
                            return customer.id
                    except stripe.error.InvalidRequestError as e:
                        # Customer doesn't exist in Stripe, create new one
                        logger.info(f"Customer {user_data['stripe_customer_id']} not found in Stripe: {e}")
                        # Clear the old customer ID from Firebase
                        user_ref.update({'stripe_customer_id': firestore.DELETE_FIELD})
                    except Exception as e:
                        logger.error(f"Error retrieving customer {user_data['stripe_customer_id']}: {e}")
                        # Clear the old customer ID from Firebase to allow recreation
                        user_ref.update({'stripe_customer_id': firestore.DELETE_FIELD})
            
            # Create new customer
            return await self.create_customer(user_id, email, name)
            
        except Exception as e:
            logger.error(f"Error getting/creating customer: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    async def create_checkout_session(self, 
                                    user_id: str, 
                                    email: str, 
                                    plan_id: str,
                                    success_url: str,
                                    cancel_url: str,
                                    name: str = None) -> Dict[str, Any]:
        """
        Create Stripe Checkout session for subscription
        """
        try:
            logger.info(f"Creating checkout session - user_id: {user_id}, email: {email}, plan_id: {plan_id}")
            logger.info(f"Price mapping: {self.price_mapping}")
            
            # Get or create customer
            customer_id = await self.get_or_create_customer(user_id, email, name)
            logger.info(f"Got/created customer: {customer_id}")
            
            # Get price ID for plan
            price_id = self.price_mapping.get(plan_id)
            logger.info(f"Looking up price for plan '{plan_id}': {price_id}")
            
            if not price_id:
                logger.error(f"No price ID found for plan: {plan_id}. Available plans: {list(self.price_mapping.keys())}")
                raise HTTPException(status_code=400, detail=f"Invalid plan: {plan_id}")
            
            # Determine if trial should be included
            trial_period_days = 3 if plan_id in ['monthly', 'annual'] else None
            
            session_params = {
                'customer': customer_id,
                'payment_method_types': ['card'],
                'line_items': [{
                    'price': price_id,
                    'quantity': 1,
                }],
                'mode': 'subscription',
                'success_url': success_url,
                'cancel_url': cancel_url,
                'metadata': {
                    'firebase_uid': user_id,
                    'plan_id': plan_id
                },
                'allow_promotion_codes': True,
                'billing_address_collection': 'required'
            }
            
            # Add trial period if applicable
            if trial_period_days:
                session_params['subscription_data'] = {
                    'trial_period_days': trial_period_days,
                    'metadata': {
                        'firebase_uid': user_id,
                        'plan_id': plan_id
                    }
                }
            else:
                # Even without trial, add metadata to subscription
                session_params['subscription_data'] = {
                    'metadata': {
                        'firebase_uid': user_id,
                        'plan_id': plan_id
                    }
                }
            
            session = stripe.checkout.Session.create(**session_params)
            
            logger.info(f"Created checkout session {session.id} for user {user_id}, plan {plan_id}")
            
            return {
                'session_id': session.id,
                'session_url': session.url,
                'customer_id': customer_id
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating checkout session: {e}")
            raise HTTPException(status_code=400, detail=f"Payment error: {str(e)}")
        except Exception as e:
            logger.error(f"Error creating checkout session: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    async def create_customer_portal_session(self, user_id: str, return_url: str) -> str:
        """
        Create Stripe Customer Portal session for subscription management
        """
        try:
            # Get user's Stripe customer ID
            db = self.get_db()
            if not db:
                raise HTTPException(status_code=500, detail="Database connection error")
            
            user_ref = db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if not user_doc.exists:
                raise HTTPException(status_code=404, detail="User not found")
                
            user_data = user_doc.to_dict()
            customer_id = user_data.get('stripe_customer_id')
            
            if not customer_id:
                raise HTTPException(status_code=400, detail="No subscription found")
            
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            
            logger.info(f"Created portal session for user {user_id}")
            return session.url
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating portal session: {e}")
            raise HTTPException(status_code=400, detail=f"Payment error: {str(e)}")
        except Exception as e:
            logger.error(f"Error creating portal session: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    async def get_subscription_status(self, user_id: str) -> Dict[str, Any]:
        """
        Get user's current subscription status
        """
        try:
            db = self.get_db()
            if not db:
                raise HTTPException(status_code=500, detail="Database connection error")
            
            user_ref = db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if not user_doc.exists:
                return {
                    'has_subscription': False,
                    'status': 'none',
                    'plan_id': None,
                    'current_period_end': None
                }
                
            user_data = user_doc.to_dict()
            customer_id = user_data.get('stripe_customer_id')
            
            if not customer_id:
                return {
                    'has_subscription': False,
                    'status': 'none',
                    'plan_id': None,
                    'current_period_end': None
                }
            
            # Get active subscriptions from Stripe
            subscriptions = stripe.Subscription.list(
                customer=customer_id,
                status='all',
                limit=10
            )
            
            active_subscription = None
            for sub in subscriptions.data:
                if sub.status in ['active', 'trialing', 'past_due']:
                    active_subscription = sub
                    break
            
            if not active_subscription:
                return {
                    'has_subscription': False,
                    'status': 'none',
                    'plan_id': None,
                    'current_period_end': None
                }
            
            # Determine plan ID from price
            plan_id = None
            try:
                price_id_from_stripe = None
                if hasattr(active_subscription, 'items') and active_subscription.items:
                    if hasattr(active_subscription.items, 'data') and active_subscription.items.data:
                        price_id_from_stripe = active_subscription.items.data[0].price.id
                    elif len(active_subscription.items) > 0:
                        price_id_from_stripe = active_subscription.items[0].price.id
                
                if price_id_from_stripe:
                    for pid, price_id in self.price_mapping.items():
                        if price_id_from_stripe == price_id:
                            plan_id = pid
                            break
            except Exception as e:
                logger.error(f"Error extracting plan ID from subscription: {e}")
                logger.info(f"Subscription items structure: {type(active_subscription.items) if hasattr(active_subscription, 'items') else 'No items'}")
            
            return {
                'has_subscription': True,
                'status': active_subscription.status,
                'plan_id': plan_id,
                'current_period_end': datetime.fromtimestamp(active_subscription.current_period_end),
                'cancel_at_period_end': active_subscription.cancel_at_period_end,
                'trial_end': datetime.fromtimestamp(active_subscription.trial_end) if active_subscription.trial_end else None
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error getting subscription status: {e}")
            raise HTTPException(status_code=400, detail=f"Payment error: {str(e)}")
        except Exception as e:
            logger.error(f"Error getting subscription status: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

    async def handle_webhook_event(self, payload: bytes, sig_header: str) -> Dict[str, Any]:
        """
        Handle Stripe webhook events
        """
        try:
            # Verify webhook signature
            if self.webhook_secret:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, self.webhook_secret
                )
            else:
                event = json.loads(payload)
                logger.warning("Webhook signature verification skipped - no secret configured")
            
            logger.info(f"Received webhook event: {event['type']}")
            
            # Handle different event types
            if event['type'] == 'customer.subscription.created':
                await self._handle_subscription_created(event['data']['object'])
            elif event['type'] == 'customer.subscription.updated':
                await self._handle_subscription_updated(event['data']['object'])
            elif event['type'] == 'customer.subscription.deleted':
                await self._handle_subscription_deleted(event['data']['object'])
            elif event['type'] == 'invoice.payment_succeeded':
                await self._handle_payment_succeeded(event['data']['object'])
            elif event['type'] == 'invoice.payment_failed':
                await self._handle_payment_failed(event['data']['object'])
            
            return {'status': 'success', 'event_type': event['type']}
            
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Webhook signature verification failed: {e}")
            raise HTTPException(status_code=400, detail="Invalid signature")
        except Exception as e:
            logger.error(f"Error handling webhook: {e}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(status_code=500, detail="Webhook processing error")

    async def _handle_subscription_created(self, subscription):
        """Handle subscription creation"""
        await self._update_user_subscription_status(subscription, 'created')

    async def _handle_subscription_updated(self, subscription):
        """Handle subscription updates"""
        await self._update_user_subscription_status(subscription, 'updated')

    async def _handle_subscription_deleted(self, subscription):
        """Handle subscription cancellation"""
        await self._update_user_subscription_status(subscription, 'deleted')

    async def _handle_payment_succeeded(self, invoice):
        """Handle successful payment"""
        try:
            if invoice.subscription:
                logger.info(f"Processing payment succeeded for subscription: {invoice.subscription}")
                subscription = stripe.Subscription.retrieve(invoice.subscription)
                await self._update_user_subscription_status(subscription, 'payment_succeeded')
            else:
                logger.info("Payment succeeded but no subscription associated")
        except Exception as e:
            logger.error(f"Error handling payment succeeded webhook: {e}")
            raise

    async def _handle_payment_failed(self, invoice):
        """Handle failed payment"""
        try:
            if invoice.subscription:
                logger.info(f"Processing payment failed for subscription: {invoice.subscription}")
                subscription = stripe.Subscription.retrieve(invoice.subscription)
                await self._update_user_subscription_status(subscription, 'payment_failed')
            else:
                logger.info("Payment failed but no subscription associated")
        except Exception as e:
            logger.error(f"Error handling payment failed webhook: {e}")
            raise

    async def _update_user_subscription_status(self, subscription, event_type: str):
        """
        Update user's subscription status in Firestore
        """
        try:
            customer_id = subscription.customer
            logger.info(f"Updating subscription for customer {customer_id}, event: {event_type}")
            
            # Find user by Stripe customer ID
            db = self.get_db()
            if not db:
                logger.error("Failed to get Firestore client in _update_user_subscription_status")
                return
            
            users_ref = db.collection('users')
            query = users_ref.where('stripe_customer_id', '==', customer_id).limit(1)
            docs = query.stream()
            
            user_doc = None
            user_count = 0
            for doc in docs:
                user_doc = doc
                user_count += 1
                logger.info(f"Found user document: {doc.id}")
                break
            
            if not user_doc:
                logger.error(f"No user found for Stripe customer {customer_id}. This is critical - user won't be updated!")
                # Let's also try to find by metadata if available
                if hasattr(subscription, 'metadata') and subscription.metadata.get('firebase_uid'):
                    firebase_uid = subscription.metadata.get('firebase_uid')
                    logger.info(f"Attempting to find user by firebase_uid from metadata: {firebase_uid}")
                    user_doc = db.collection('users').document(firebase_uid).get()
                    if user_doc.exists:
                        logger.info(f"Found user by firebase_uid: {firebase_uid}")
                    else:
                        logger.error(f"User not found by firebase_uid either: {firebase_uid}")
                        return
                else:
                    return
            
            # Determine plan ID
            plan_id = None
            price_id_from_stripe = None
            
            try:
                # Handle both subscription.items.data and subscription.items attribute access
                if hasattr(subscription, 'items') and subscription.items:
                    if hasattr(subscription.items, 'data') and subscription.items.data:
                        price_id_from_stripe = subscription.items.data[0].price.id
                    elif len(subscription.items) > 0:
                        price_id_from_stripe = subscription.items[0].price.id
                logger.info(f"Stripe price ID: {price_id_from_stripe}")
            except Exception as e:
                logger.error(f"Error extracting price ID from subscription: {e}")
                logger.info(f"Subscription items structure: {type(subscription.items) if hasattr(subscription, 'items') else 'No items'}")
            
            logger.info(f"Price mapping: {self.price_mapping}")
            
            for pid, price_id in self.price_mapping.items():
                if price_id and price_id_from_stripe == price_id:
                    plan_id = pid
                    break
            
            if not plan_id:
                logger.warning(f"Could not determine plan ID from price {price_id_from_stripe}")
            
            # Determine premium status
            is_premium = subscription.status in ['active', 'trialing']
            logger.info(f"Subscription status: {subscription.status}, isPremium will be: {is_premium}")
            
            # Update user document
            update_data = {
                'isPremium': is_premium,
                'subscriptionType': plan_id,
                'subscriptionStatus': subscription.status,
                'subscriptionId': subscription.id,
                'currentPeriodEnd': datetime.fromtimestamp(subscription.current_period_end),
                'cancelAtPeriodEnd': subscription.cancel_at_period_end,
                'updated_at': datetime.utcnow(),
                'lastWebhookEvent': event_type,
                'lastWebhookAt': datetime.utcnow()
            }
            
            if subscription.trial_end:
                update_data['trialEnd'] = datetime.fromtimestamp(subscription.trial_end)
            
            # Get user document ID properly
            user_id = None
            if hasattr(user_doc, 'id'):
                user_id = user_doc.id
            elif hasattr(user_doc, 'reference'):
                user_id = user_doc.reference.id
            
            logger.info(f"Updating user {user_id} with data: {update_data}")
            
            # Handle both document reference types
            if hasattr(user_doc, 'reference'):
                # This is from a query result
                user_doc.reference.update(update_data)
            elif hasattr(user_doc, 'id'):
                # This is a direct document get
                db.collection('users').document(user_doc.id).update(update_data)
            else:
                logger.error(f"Unable to determine document reference type for user update")
                return
            
            logger.info(f"Successfully updated subscription status for user {user_id}: {subscription.status}, isPremium={is_premium}")
            
        except Exception as e:
            logger.error(f"Error updating user subscription status: {e}")
    
    # Webhook event handlers
    async def process_webhook_event(self, event_type: str, event_data: Dict[str, Any]):
        """Process a Stripe webhook event"""
        event_handlers = {
            'customer.subscription.created': self.handle_subscription_created,
            'customer.subscription.updated': self.handle_subscription_updated,
            'customer.subscription.deleted': self.handle_subscription_deleted,
            'customer.subscription.trial_will_end': self.handle_trial_ending,
            'invoice.payment_succeeded': self.handle_payment_succeeded,
            'invoice.payment_failed': self.handle_payment_failed,
            'customer.created': self.handle_customer_created,
            'customer.updated': self.handle_customer_updated,
            'payment_method.attached': self.handle_payment_method_attached,
            'checkout.session.completed': self.handle_checkout_completed
        }
        
        handler = event_handlers.get(event_type)
        if handler:
            try:
                await handler(event_data)
                logger.info(f"Successfully processed {event_type}")
            except Exception as e:
                logger.error(f"Error processing {event_type}: {e}")
                raise
        else:
            logger.info(f"No handler for event type: {event_type}")
    
    async def handle_subscription_created(self, subscription: Dict[str, Any]):
        """Handle new subscription creation"""
        await self.update_user_subscription_status(subscription, 'customer.subscription.created')
    
    async def handle_subscription_updated(self, subscription: Dict[str, Any]):
        """Handle subscription updates"""
        await self.update_user_subscription_status(subscription, 'customer.subscription.updated')
    
    async def handle_subscription_deleted(self, subscription: Dict[str, Any]):
        """Handle subscription cancellation"""
        customer_id = subscription['customer']
        
        # Get user by customer ID
        user_id = await self._get_user_id_by_customer(customer_id)
        if not user_id:
            return
        
        # Remove premium status
        premium_data = {
            'isPremium': False,
            'subscriptionStatus': 'canceled',
            'canceledAt': datetime.utcnow(),
            'previousSubscriptionId': subscription['id'],
            'updated_at': datetime.utcnow()
        }
        
        db = self.get_db()
        if db:
            db.collection('users').document(user_id).update(premium_data)
        logger.info(f"Canceled subscription for user {user_id}")
    
    async def handle_trial_ending(self, subscription: Dict[str, Any]):
        """Handle trial ending notification"""
        customer_id = subscription['customer']
        trial_end = datetime.fromtimestamp(subscription['trial_end'])
        
        # Get user by customer ID
        user_id = await self._get_user_id_by_customer(customer_id)
        if not user_id:
            return
        
        # Create notification
        notification = {
            'user_id': user_id,
            'type': 'trial_ending',
            'title': 'Your trial is ending soon',
            'message': f'Your trial will end on {trial_end.strftime("%B %d, %Y")}. Add a payment method to continue.',
            'created_at': datetime.utcnow(),
            'read': False,
            'subscription_id': subscription['id']
        }
        
        db = self.get_db()
        if db:
            db.collection('notifications').add(notification)
        logger.info(f"Trial ending notification sent for user {user_id}")
    
    async def handle_payment_succeeded(self, invoice: Dict[str, Any]):
        """Handle successful payment"""
        customer_id = invoice['customer']
        
        # Get user by customer ID
        user_id = await self._get_user_id_by_customer(customer_id)
        if not user_id:
            return
        
        # Record payment
        payment_record = {
            'user_id': user_id,
            'invoice_id': invoice['id'],
            'amount': invoice['amount_paid'] / 100,  # Convert from cents
            'currency': invoice['currency'],
            'status': 'succeeded',
            'payment_date': datetime.fromtimestamp(invoice['created']),
            'description': invoice.get('description', 'Subscription payment')
        }
        
        db = self.get_db()
        if db:
            db.collection('payments').add(payment_record)
        logger.info(f"Payment succeeded for user {user_id}: ${payment_record['amount']}")
    
    async def handle_payment_failed(self, invoice: Dict[str, Any]):
        """Handle failed payment"""
        customer_id = invoice['customer']
        
        # Get user by customer ID
        user_id = await self._get_user_id_by_customer(customer_id)
        if not user_id:
            return
        
        # Create notification
        notification = {
            'user_id': user_id,
            'type': 'payment_failed',
            'title': 'Payment failed',
            'message': 'We were unable to process your payment. Please update your payment method.',
            'created_at': datetime.utcnow(),
            'read': False,
            'invoice_id': invoice['id']
        }
        
        db = self.get_db()
        if db:
            db.collection('notifications').add(notification)
            
            # Update user status
            db.collection('users').document(user_id).update({
            'payment_status': 'failed',
            'payment_failed_at': datetime.utcnow()
        })
        
        logger.info(f"Payment failed for user {user_id}")
    
    async def handle_customer_created(self, customer: Dict[str, Any]):
        """Handle new Stripe customer creation"""
        email = customer.get('email')
        if not email:
            return
        
        # Find user by email
        db = self.get_db()
        if not db:
            return
        
        users = db.collection('users').where('email', '==', email).limit(1).get()
        if not users:
            logger.warning(f"No user found for email {email}")
            return
        
        user_id = users[0].id
        
        # Store customer ID
        db.collection('users').document(user_id).update({
            'stripe_customer_id': customer['id'],
            'stripe_customer_created': datetime.utcnow()
        })
        
        logger.info(f"Linked Stripe customer {customer['id']} to user {user_id}")
    
    async def handle_customer_updated(self, customer: Dict[str, Any]):
        """Handle customer updates"""
        # Update customer information if needed
        pass
    
    async def handle_payment_method_attached(self, payment_method: Dict[str, Any]):
        """Handle payment method attachment"""
        customer_id = payment_method['customer']
        
        # Get user by customer ID
        user_id = await self._get_user_id_by_customer(customer_id)
        if not user_id:
            return
        
        # Update user's payment method info
        db = self.get_db()
        if db:
            db.collection('users').document(user_id).update({
            'has_payment_method': True,
            'payment_method_type': payment_method['type'],
            'payment_method_last4': payment_method.get('card', {}).get('last4'),
            'payment_method_updated': datetime.utcnow()
        })
        
        logger.info(f"Payment method attached for user {user_id}")
    
    async def handle_checkout_completed(self, session: Dict[str, Any]):
        """Handle completed checkout session"""
        customer_id = session.get('customer')
        if not customer_id:
            return
        
        # Get user by customer ID
        user_id = await self._get_user_id_by_customer(customer_id)
        if not user_id:
            # Try to link by client_reference_id (usually user_id)
            client_ref = session.get('client_reference_id')
            if client_ref:
                user_id = client_ref
                # Store customer ID
                db = self.get_db()
                if db:
                    db.collection('users').document(user_id).update({
                        'stripe_customer_id': customer_id
                    })
        
        if user_id:
            # Record checkout completion
            db = self.get_db()
            if db:
                db.collection('users').document(user_id).update({
                'last_checkout_completed': datetime.utcnow(),
                'checkout_session_id': session['id']
            })
            
            logger.info(f"Checkout completed for user {user_id}")
    
    async def _get_user_id_by_customer(self, customer_id: str) -> Optional[str]:
        """Get user ID by Stripe customer ID"""
        db = self.get_db()
        if not db:
            return None
        
        users = db.collection('users').where('stripe_customer_id', '==', customer_id).limit(1).get()
        if users:
            return users[0].id
        return None

    async def cancel_subscription(self, customer_id: str) -> Dict[str, Any]:
        """Cancel a customer's subscription"""
        try:
            # Get active subscriptions
            subscriptions = stripe.Subscription.list(
                customer=customer_id,
                status='active',
                limit=1
            )
            
            if not subscriptions.data:
                raise HTTPException(status_code=404, detail="No active subscription found")
            
            # Cancel the subscription at period end
            subscription = stripe.Subscription.modify(
                subscriptions.data[0].id,
                cancel_at_period_end=True
            )
            
            logger.info(f"Subscription {subscription.id} set to cancel at period end")
            
            return {
                'subscription_id': subscription.id,
                'cancel_at_period_end': subscription.cancel_at_period_end,
                'current_period_end': datetime.fromtimestamp(subscription.current_period_end)
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error canceling subscription: {e}")
            raise HTTPException(status_code=400, detail=f"Payment error: {str(e)}")
        except Exception as e:
            logger.error(f"Error canceling subscription: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")

# Global instance will be created in main.py with proper error handling