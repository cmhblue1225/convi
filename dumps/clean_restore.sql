--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.5 (Homebrew)

-- Started on 2025-08-08 12:32:16 KST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP EVENT TRIGGER pgrst_drop_watch;
DROP EVENT TRIGGER pgrst_ddl_watch;
DROP EVENT TRIGGER issue_pg_net_access;
DROP EVENT TRIGGER issue_pg_graphql_access;
DROP EVENT TRIGGER issue_pg_cron_access;
DROP EVENT TRIGGER issue_graphql_placeholder;
DROP PUBLICATION supabase_realtime_messages_publication;
DROP PUBLICATION supabase_realtime;
DROP POLICY "사용자는 찜하기/취소만 할 수 있음" ON public.product_wishlists;
DROP POLICY "사용자는 자신의 찜 목록만 추가 가능" ON public.wishlists;
DROP POLICY "사용자는 자신의 찜 목록만 조회 가능" ON public.wishlists;
DROP POLICY "사용자는 자신의 찜 목록만 삭제 가능" ON public.wishlists;
DROP POLICY "사용자는 자신의 찜 목록만 볼 수 있음" ON public.product_wishlists;
DROP POLICY "Users can view their own wishlists" ON public.wishlists;
DROP POLICY "Users can view own profile" ON public.profiles;
DROP POLICY "Users can view own notifications" ON public.notifications;
DROP POLICY "Users can view order status history based on order access" ON public.order_status_history;
DROP POLICY "Users can view order items based on order access" ON public.order_items;
DROP POLICY "Users can update own profile" ON public.profiles;
DROP POLICY "Users can update own notifications" ON public.notifications;
DROP POLICY "Users can manage supply request items based on request access" ON public.supply_request_items;
DROP POLICY "Users can insert own profile" ON public.profiles;
DROP POLICY "Users can delete their own wishlists" ON public.wishlists;
DROP POLICY "Users can create their own wishlists" ON public.wishlists;
DROP POLICY "Store owners can view own store" ON public.stores;
DROP POLICY "Store owners can view own shipments" ON public.shipments;
DROP POLICY "Store owners can view own sales summary" ON public.daily_sales_summary;
DROP POLICY "Store owners can view own product sales" ON public.product_sales_summary;
DROP POLICY "Store owners can update own store" ON public.stores;
DROP POLICY "Store owners can manage store orders" ON public.orders;
DROP POLICY "Store owners can manage own supply requests" ON public.supply_requests;
DROP POLICY "Store owners can manage own store products" ON public.store_products;
DROP POLICY "Store owners can manage own inventory transactions" ON public.inventory_transactions;
DROP POLICY "Store owners can create own store" ON public.stores;
DROP POLICY "Store owners can create order status history" ON public.order_status_history;
DROP POLICY "Only HQ can manage shipments" ON public.shipments;
DROP POLICY "Only HQ can manage products" ON public.products;
DROP POLICY "Only HQ can manage categories" ON public.categories;
DROP POLICY "HQ can view all sales summary" ON public.daily_sales_summary;
DROP POLICY "HQ can view all product sales" ON public.product_sales_summary;
DROP POLICY "HQ can view all orders" ON public.orders;
DROP POLICY "HQ can manage all supply requests" ON public.supply_requests;
DROP POLICY "HQ can manage all stores" ON public.stores;
DROP POLICY "HQ can manage all store products" ON public.store_products;
DROP POLICY "HQ can manage all settings" ON public.system_settings;
DROP POLICY "HQ can manage all inventory transactions" ON public.inventory_transactions;
DROP POLICY "Customers can view own orders" ON public.orders;
DROP POLICY "Customers can view available store products" ON public.store_products;
DROP POLICY "Customers can delete own orders" ON public.orders;
DROP POLICY "Customers can delete own order items" ON public.order_items;
DROP POLICY "Customers can create own orders" ON public.orders;
DROP POLICY "Customers can create order items for own orders" ON public.order_items;
DROP POLICY "Customers can create inventory transactions for own orders" ON public.inventory_transactions;
DROP POLICY "Anyone can view public settings" ON public.system_settings;
DROP POLICY "Anyone can view products" ON public.products;
DROP POLICY "Anyone can view categories" ON public.categories;
DROP POLICY "Anyone can view active stores" ON public.stores;
DROP POLICY "Allow creating notifications for users" ON public.notifications;
ALTER TABLE ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey;
ALTER TABLE ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey;
ALTER TABLE ONLY storage.s3_multipart_uploads DROP CONSTRAINT s3_multipart_uploads_bucket_id_fkey;
ALTER TABLE ONLY storage.prefixes DROP CONSTRAINT "prefixes_bucketId_fkey";
ALTER TABLE ONLY storage.objects DROP CONSTRAINT "objects_bucketId_fkey";
ALTER TABLE ONLY public.wishlists DROP CONSTRAINT wishlists_user_id_fkey;
ALTER TABLE ONLY public.wishlists DROP CONSTRAINT wishlists_product_id_fkey;
ALTER TABLE ONLY public.supply_requests DROP CONSTRAINT supply_requests_store_id_fkey;
ALTER TABLE ONLY public.supply_requests DROP CONSTRAINT supply_requests_requested_by_fkey;
ALTER TABLE ONLY public.supply_requests DROP CONSTRAINT supply_requests_approved_by_fkey;
ALTER TABLE ONLY public.supply_request_items DROP CONSTRAINT supply_request_items_supply_request_id_fkey;
ALTER TABLE ONLY public.supply_request_items DROP CONSTRAINT supply_request_items_product_id_fkey;
ALTER TABLE ONLY public.stores DROP CONSTRAINT stores_owner_id_fkey;
ALTER TABLE ONLY public.store_products DROP CONSTRAINT store_products_store_id_fkey;
ALTER TABLE ONLY public.store_products DROP CONSTRAINT store_products_product_id_fkey;
ALTER TABLE ONLY public.shipments DROP CONSTRAINT shipments_supply_request_id_fkey;
ALTER TABLE ONLY public.products DROP CONSTRAINT products_category_id_fkey;
ALTER TABLE ONLY public.product_wishlists DROP CONSTRAINT product_wishlists_user_id_fkey;
ALTER TABLE ONLY public.product_wishlists DROP CONSTRAINT product_wishlists_product_id_fkey;
ALTER TABLE ONLY public.product_sales_summary DROP CONSTRAINT product_sales_summary_store_id_fkey;
ALTER TABLE ONLY public.product_sales_summary DROP CONSTRAINT product_sales_summary_product_id_fkey;
ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_store_id_fkey;
ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_customer_id_fkey;
ALTER TABLE ONLY public.order_status_history DROP CONSTRAINT order_status_history_order_id_fkey;
ALTER TABLE ONLY public.order_status_history DROP CONSTRAINT order_status_history_changed_by_fkey;
ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_product_id_fkey;
ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_order_id_fkey;
ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_user_id_fkey;
ALTER TABLE ONLY public.inventory_transactions DROP CONSTRAINT inventory_transactions_store_product_id_fkey;
ALTER TABLE ONLY public.inventory_transactions DROP CONSTRAINT inventory_transactions_created_by_fkey;
ALTER TABLE ONLY public.daily_sales_summary DROP CONSTRAINT daily_sales_summary_store_id_fkey;
ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_parent_id_fkey;
ALTER TABLE ONLY auth.sso_domains DROP CONSTRAINT sso_domains_sso_provider_id_fkey;
ALTER TABLE ONLY auth.sessions DROP CONSTRAINT sessions_user_id_fkey;
ALTER TABLE ONLY auth.saml_relay_states DROP CONSTRAINT saml_relay_states_sso_provider_id_fkey;
ALTER TABLE ONLY auth.saml_relay_states DROP CONSTRAINT saml_relay_states_flow_state_id_fkey;
ALTER TABLE ONLY auth.saml_providers DROP CONSTRAINT saml_providers_sso_provider_id_fkey;
ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_session_id_fkey;
ALTER TABLE ONLY auth.one_time_tokens DROP CONSTRAINT one_time_tokens_user_id_fkey;
ALTER TABLE ONLY auth.mfa_factors DROP CONSTRAINT mfa_factors_user_id_fkey;
ALTER TABLE ONLY auth.mfa_challenges DROP CONSTRAINT mfa_challenges_auth_factor_id_fkey;
ALTER TABLE ONLY auth.mfa_amr_claims DROP CONSTRAINT mfa_amr_claims_session_id_fkey;
ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_user_id_fkey;
DROP TRIGGER update_objects_updated_at ON storage.objects;
DROP TRIGGER prefixes_delete_hierarchy ON storage.prefixes;
DROP TRIGGER prefixes_create_hierarchy ON storage.prefixes;
DROP TRIGGER objects_update_create_prefix ON storage.objects;
DROP TRIGGER objects_insert_create_prefix ON storage.objects;
DROP TRIGGER objects_delete_delete_prefix ON storage.objects;
DROP TRIGGER enforce_bucket_name_length_trigger ON storage.buckets;
DROP TRIGGER tr_check_filters ON realtime.subscription;
DROP TRIGGER update_store_product_stock_trigger ON public.inventory_transactions;
DROP TRIGGER trigger_validate_order_service ON public.orders;
DROP TRIGGER trigger_update_inventory_on_supply_delivery ON public.supply_requests;
DROP TRIGGER trigger_shipment_delivery ON public.shipments;
DROP TRIGGER trigger_prevent_duplicate_orders ON public.orders;
DROP TRIGGER trigger_order_completion ON public.orders;
DROP TRIGGER trigger_low_stock_check ON public.store_products;
DROP TRIGGER trigger_initialize_store_products ON public.stores;
DROP TRIGGER set_supply_request_number_trigger ON public.supply_requests;
DROP TRIGGER set_shipment_number_trigger ON public.shipments;
DROP TRIGGER set_order_number_trigger ON public.orders;
DROP TRIGGER log_order_status_change_trigger ON public.orders;
DROP INDEX storage.objects_bucket_id_level_idx;
DROP INDEX storage.name_prefix_search;
DROP INDEX storage.idx_prefixes_lower_name;
DROP INDEX storage.idx_objects_lower_name;
DROP INDEX storage.idx_objects_bucket_id_name;
DROP INDEX storage.idx_name_bucket_level_unique;
DROP INDEX storage.idx_multipart_uploads_list;
DROP INDEX storage.bucketid_objname;
DROP INDEX storage.bname;
DROP INDEX realtime.subscription_subscription_id_entity_filters_key;
DROP INDEX realtime.ix_realtime_subscription_entity;
DROP INDEX public.idx_supply_requests_store_id;
DROP INDEX public.idx_stores_owner_id;
DROP INDEX public.idx_store_products_store_id;
DROP INDEX public.idx_profiles_role;
DROP INDEX public.idx_products_category_id;
DROP INDEX public.idx_product_sales_summary_store_product_date;
DROP INDEX public.idx_orders_store_id;
DROP INDEX public.idx_orders_status;
DROP INDEX public.idx_orders_payment_key;
DROP INDEX public.idx_orders_customer_id;
DROP INDEX public.idx_orders_customer_created;
DROP INDEX public.idx_order_status_history_order_id;
DROP INDEX public.idx_order_items_order_id;
DROP INDEX public.idx_notifications_user_id;
DROP INDEX public.idx_inventory_transactions_store_product_id;
DROP INDEX public.idx_daily_sales_summary_store_date;
DROP INDEX public.idx_categories_parent_id;
DROP INDEX auth.users_is_anonymous_idx;
DROP INDEX auth.users_instance_id_idx;
DROP INDEX auth.users_instance_id_email_idx;
DROP INDEX auth.users_email_partial_key;
DROP INDEX auth.user_id_created_at_idx;
DROP INDEX auth.unique_phone_factor_per_user;
DROP INDEX auth.sso_providers_resource_id_idx;
DROP INDEX auth.sso_domains_sso_provider_id_idx;
DROP INDEX auth.sso_domains_domain_idx;
DROP INDEX auth.sessions_user_id_idx;
DROP INDEX auth.sessions_not_after_idx;
DROP INDEX auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX auth.saml_relay_states_for_email_idx;
DROP INDEX auth.saml_relay_states_created_at_idx;
DROP INDEX auth.saml_providers_sso_provider_id_idx;
DROP INDEX auth.refresh_tokens_updated_at_idx;
DROP INDEX auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX auth.refresh_tokens_parent_idx;
DROP INDEX auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX auth.refresh_tokens_instance_id_idx;
DROP INDEX auth.recovery_token_idx;
DROP INDEX auth.reauthentication_token_idx;
DROP INDEX auth.one_time_tokens_user_id_token_type_key;
DROP INDEX auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX auth.mfa_factors_user_id_idx;
DROP INDEX auth.mfa_factors_user_friendly_name_unique;
DROP INDEX auth.mfa_challenge_created_at_idx;
DROP INDEX auth.idx_user_id_auth_method;
DROP INDEX auth.idx_auth_code;
DROP INDEX auth.identities_user_id_idx;
DROP INDEX auth.identities_email_idx;
DROP INDEX auth.flow_state_created_at_idx;
DROP INDEX auth.factor_id_created_at_idx;
DROP INDEX auth.email_change_token_new_idx;
DROP INDEX auth.email_change_token_current_idx;
DROP INDEX auth.confirmation_token_idx;
DROP INDEX auth.audit_logs_instance_id_idx;
ALTER TABLE ONLY supabase_migrations.seed_files DROP CONSTRAINT seed_files_pkey;
ALTER TABLE ONLY supabase_migrations.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
ALTER TABLE ONLY supabase_migrations.schema_migrations DROP CONSTRAINT schema_migrations_idempotency_key_key;
ALTER TABLE ONLY storage.s3_multipart_uploads DROP CONSTRAINT s3_multipart_uploads_pkey;
ALTER TABLE ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT s3_multipart_uploads_parts_pkey;
ALTER TABLE ONLY storage.prefixes DROP CONSTRAINT prefixes_pkey;
ALTER TABLE ONLY storage.objects DROP CONSTRAINT objects_pkey;
ALTER TABLE ONLY storage.migrations DROP CONSTRAINT migrations_pkey;
ALTER TABLE ONLY storage.migrations DROP CONSTRAINT migrations_name_key;
ALTER TABLE ONLY storage.buckets DROP CONSTRAINT buckets_pkey;
ALTER TABLE ONLY storage.buckets_analytics DROP CONSTRAINT buckets_analytics_pkey;
ALTER TABLE ONLY realtime.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
ALTER TABLE ONLY realtime.subscription DROP CONSTRAINT pk_subscription;
ALTER TABLE ONLY realtime.messages_2025_08_10 DROP CONSTRAINT messages_2025_08_10_pkey;
ALTER TABLE ONLY realtime.messages_2025_08_09 DROP CONSTRAINT messages_2025_08_09_pkey;
ALTER TABLE ONLY realtime.messages_2025_08_08 DROP CONSTRAINT messages_2025_08_08_pkey;
ALTER TABLE ONLY realtime.messages_2025_08_07 DROP CONSTRAINT messages_2025_08_07_pkey;
ALTER TABLE ONLY realtime.messages_2025_08_06 DROP CONSTRAINT messages_2025_08_06_pkey;
ALTER TABLE ONLY realtime.messages DROP CONSTRAINT messages_pkey;
ALTER TABLE ONLY public.wishlists DROP CONSTRAINT wishlists_user_product_unique;
ALTER TABLE ONLY public.wishlists DROP CONSTRAINT wishlists_pkey;
ALTER TABLE ONLY public.system_settings DROP CONSTRAINT system_settings_pkey;
ALTER TABLE ONLY public.system_settings DROP CONSTRAINT system_settings_key_key;
ALTER TABLE ONLY public.supply_requests DROP CONSTRAINT supply_requests_request_number_key;
ALTER TABLE ONLY public.supply_requests DROP CONSTRAINT supply_requests_pkey;
ALTER TABLE ONLY public.supply_request_items DROP CONSTRAINT supply_request_items_pkey;
ALTER TABLE ONLY public.stores DROP CONSTRAINT stores_pkey;
ALTER TABLE ONLY public.store_products DROP CONSTRAINT store_products_pkey;
ALTER TABLE ONLY public.shipments DROP CONSTRAINT shipments_shipment_number_key;
ALTER TABLE ONLY public.shipments DROP CONSTRAINT shipments_pkey;
ALTER TABLE ONLY public.profiles DROP CONSTRAINT profiles_pkey;
ALTER TABLE ONLY public.products DROP CONSTRAINT products_pkey;
ALTER TABLE ONLY public.products DROP CONSTRAINT products_barcode_key;
ALTER TABLE ONLY public.product_wishlists DROP CONSTRAINT product_wishlists_product_id_user_id_key;
ALTER TABLE ONLY public.product_wishlists DROP CONSTRAINT product_wishlists_pkey;
ALTER TABLE ONLY public.product_sales_summary DROP CONSTRAINT product_sales_summary_pkey;
ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_pkey;
ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_order_number_key;
ALTER TABLE ONLY public.order_status_history DROP CONSTRAINT order_status_history_pkey;
ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_pkey;
ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_pkey;
ALTER TABLE ONLY public.inventory_transactions DROP CONSTRAINT inventory_transactions_pkey;
ALTER TABLE ONLY public.daily_sales_summary DROP CONSTRAINT daily_sales_summary_pkey;
ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_slug_key;
ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pkey;
ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_name_key;
ALTER TABLE ONLY auth.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY auth.users DROP CONSTRAINT users_phone_key;
ALTER TABLE ONLY auth.sso_providers DROP CONSTRAINT sso_providers_pkey;
ALTER TABLE ONLY auth.sso_domains DROP CONSTRAINT sso_domains_pkey;
ALTER TABLE ONLY auth.sessions DROP CONSTRAINT sessions_pkey;
ALTER TABLE ONLY auth.schema_migrations DROP CONSTRAINT schema_migrations_pkey;
ALTER TABLE ONLY auth.saml_relay_states DROP CONSTRAINT saml_relay_states_pkey;
ALTER TABLE ONLY auth.saml_providers DROP CONSTRAINT saml_providers_pkey;
ALTER TABLE ONLY auth.saml_providers DROP CONSTRAINT saml_providers_entity_id_key;
ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_token_unique;
ALTER TABLE ONLY auth.refresh_tokens DROP CONSTRAINT refresh_tokens_pkey;
ALTER TABLE ONLY auth.one_time_tokens DROP CONSTRAINT one_time_tokens_pkey;
ALTER TABLE ONLY auth.mfa_factors DROP CONSTRAINT mfa_factors_pkey;
ALTER TABLE ONLY auth.mfa_factors DROP CONSTRAINT mfa_factors_last_challenged_at_key;
ALTER TABLE ONLY auth.mfa_challenges DROP CONSTRAINT mfa_challenges_pkey;
ALTER TABLE ONLY auth.mfa_amr_claims DROP CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE ONLY auth.instances DROP CONSTRAINT instances_pkey;
ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_provider_id_provider_unique;
ALTER TABLE ONLY auth.identities DROP CONSTRAINT identities_pkey;
ALTER TABLE ONLY auth.flow_state DROP CONSTRAINT flow_state_pkey;
ALTER TABLE ONLY auth.audit_log_entries DROP CONSTRAINT audit_log_entries_pkey;
ALTER TABLE ONLY auth.mfa_amr_claims DROP CONSTRAINT amr_id_pk;
ALTER TABLE auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE supabase_migrations.seed_files;
DROP TABLE supabase_migrations.schema_migrations;
DROP TABLE storage.s3_multipart_uploads_parts;
DROP TABLE storage.s3_multipart_uploads;
DROP TABLE storage.prefixes;
DROP TABLE storage.objects;
DROP TABLE storage.migrations;
DROP TABLE storage.buckets_analytics;
DROP TABLE storage.buckets;
DROP TABLE realtime.subscription;
DROP TABLE realtime.schema_migrations;
DROP TABLE realtime.messages_2025_08_10;
DROP TABLE realtime.messages_2025_08_09;
DROP TABLE realtime.messages_2025_08_08;
DROP TABLE realtime.messages_2025_08_07;
DROP TABLE realtime.messages_2025_08_06;
DROP TABLE realtime.messages;
DROP TABLE public.wishlists;
DROP TABLE public.system_settings;
DROP TABLE public.supply_requests;
DROP TABLE public.supply_request_items;
DROP VIEW public.store_sales_analytics;
DROP TABLE public.stores;
DROP TABLE public.store_products;
DROP TABLE public.shipments;
DROP TABLE public.profiles;
DROP TABLE public.product_wishlists;
DROP TABLE public.product_sales_summary;
DROP VIEW public.product_sales_analytics;
DROP TABLE public.products;
DROP VIEW public.payment_method_analytics;
DROP TABLE public.order_status_history;
DROP TABLE public.order_items;
DROP TABLE public.notifications;
DROP TABLE public.inventory_transactions;
DROP VIEW public.hourly_sales_analytics;
DROP TABLE public.daily_sales_summary;
DROP VIEW public.daily_sales_analytics;
DROP TABLE public.orders;
DROP TABLE public.categories;
DROP TABLE auth.users;
DROP TABLE auth.sso_providers;
DROP TABLE auth.sso_domains;
DROP TABLE auth.sessions;
DROP TABLE auth.schema_migrations;
DROP TABLE auth.saml_relay_states;
DROP TABLE auth.saml_providers;
DROP SEQUENCE auth.refresh_tokens_id_seq;
DROP TABLE auth.refresh_tokens;
DROP TABLE auth.one_time_tokens;
DROP TABLE auth.mfa_factors;
DROP TABLE auth.mfa_challenges;
DROP TABLE auth.mfa_amr_claims;
DROP TABLE auth.instances;
DROP TABLE auth.identities;
DROP TABLE auth.flow_state;
DROP TABLE auth.audit_log_entries;
DROP FUNCTION storage.update_updated_at_column();
DROP FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text);
DROP FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION storage.prefixes_insert_trigger();
DROP FUNCTION storage.operation();
DROP FUNCTION storage.objects_update_prefix_trigger();
DROP FUNCTION storage.objects_insert_prefix_trigger();
DROP FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text);
DROP FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
DROP FUNCTION storage.get_size_by_bucket();
DROP FUNCTION storage.get_prefixes(name text);
DROP FUNCTION storage.get_prefix(name text);
DROP FUNCTION storage.get_level(name text);
DROP FUNCTION storage.foldername(name text);
DROP FUNCTION storage.filename(name text);
DROP FUNCTION storage.extension(name text);
DROP FUNCTION storage.enforce_bucket_name_length();
DROP FUNCTION storage.delete_prefix_hierarchy_trigger();
DROP FUNCTION storage.delete_prefix(_bucket_id text, _name text);
DROP FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
DROP FUNCTION storage.add_prefixes(_bucket_id text, _name text);
DROP FUNCTION realtime.topic();
DROP FUNCTION realtime.to_regrole(role_name text);
DROP FUNCTION realtime.subscription_check_filters();
DROP FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean);
DROP FUNCTION realtime.quote_wal2json(entity regclass);
DROP FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer);
DROP FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
DROP FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
DROP FUNCTION realtime."cast"(val text, type_ regtype);
DROP FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
DROP FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text);
DROP FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer);
DROP FUNCTION public.validate_store_service(p_store_id uuid, p_service_type text);
DROP FUNCTION public.validate_order_service();
DROP FUNCTION public.update_updated_at_column();
DROP FUNCTION public.update_store_product_stock();
DROP FUNCTION public.update_inventory_on_supply_delivery();
DROP FUNCTION public.toggle_wishlist(product_id_param uuid, user_id_param uuid);
DROP FUNCTION public.prevent_duplicate_orders();
DROP FUNCTION public.log_order_status_change();
DROP FUNCTION public.initialize_store_products();
DROP FUNCTION public.handle_shipment_delivery();
DROP FUNCTION public.handle_order_completion();
DROP FUNCTION public.get_store_rankings(start_date date, end_date date);
DROP FUNCTION public.get_sales_summary(start_date date, end_date date);
DROP FUNCTION public.get_product_rankings(start_date date, end_date date);
DROP FUNCTION public.generate_supply_request_number();
DROP FUNCTION public.generate_shipment_number();
DROP FUNCTION public.generate_order_number();
DROP FUNCTION public.check_low_stock();
DROP FUNCTION pgbouncer.get_auth(p_usename text);
DROP FUNCTION extensions.set_graphql_placeholder();
DROP FUNCTION extensions.pgrst_drop_watch();
DROP FUNCTION extensions.pgrst_ddl_watch();
DROP FUNCTION extensions.grant_pg_net_access();
DROP FUNCTION extensions.grant_pg_graphql_access();
DROP FUNCTION extensions.grant_pg_cron_access();
DROP FUNCTION auth.uid();
DROP FUNCTION auth.role();
DROP FUNCTION auth.jwt();
DROP FUNCTION auth.email();
DROP TYPE storage.buckettype;
DROP TYPE realtime.wal_rls;
DROP TYPE realtime.wal_column;
DROP TYPE realtime.user_defined_filter;
DROP TYPE realtime.equality_op;
DROP TYPE realtime.action;
DROP TYPE auth.one_time_token_type;
DROP TYPE auth.factor_type;
DROP TYPE auth.factor_status;
DROP TYPE auth.code_challenge_method;
DROP TYPE auth.aal_level;
DROP EXTENSION "uuid-ossp";
DROP EXTENSION supabase_vault;
DROP EXTENSION postgis_topology;
DROP EXTENSION postgis;
DROP EXTENSION pgcrypto;
DROP EXTENSION pg_stat_statements;
DROP EXTENSION pg_graphql;
DROP SCHEMA vault;
DROP SCHEMA topology;
DROP SCHEMA supabase_migrations;
DROP SCHEMA storage;
DROP SCHEMA realtime;
DROP SCHEMA pgbouncer;
DROP SCHEMA graphql_public;
DROP SCHEMA graphql;
DROP SCHEMA extensions;
DROP SCHEMA auth;
--
-- TOC entry 35 (class 2615 OID 16492)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- TOC entry 24 (class 2615 OID 16388)
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- TOC entry 34 (class 2615 OID 16622)
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- TOC entry 33 (class 2615 OID 16611)
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- TOC entry 14 (class 2615 OID 16386)
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- TOC entry 11 (class 2615 OID 16603)
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- TOC entry 36 (class 2615 OID 16540)
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- TOC entry 25 (class 2615 OID 19171)
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- TOC entry 17 (class 2615 OID 18392)
-- Name: topology; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA topology;


--
-- TOC entry 5476 (class 0 OID 0)
-- Dependencies: 17
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- TOC entry 32 (class 2615 OID 16651)
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- TOC entry 6 (class 3079 OID 16687)
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- TOC entry 5477 (class 0 OID 0)
-- Dependencies: 6
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- TOC entry 2 (class 3079 OID 16389)
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- TOC entry 5478 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- TOC entry 4 (class 3079 OID 16441)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- TOC entry 5479 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 7 (class 3079 OID 17348)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 5480 (class 0 OID 0)
-- Dependencies: 7
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- TOC entry 8 (class 3079 OID 18393)
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- TOC entry 5481 (class 0 OID 0)
-- Dependencies: 8
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- TOC entry 5 (class 3079 OID 16652)
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- TOC entry 5482 (class 0 OID 0)
-- Dependencies: 5
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- TOC entry 3 (class 3079 OID 16430)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- TOC entry 5483 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1948 (class 1247 OID 16780)
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- TOC entry 1972 (class 1247 OID 16921)
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- TOC entry 1945 (class 1247 OID 16774)
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- TOC entry 1942 (class 1247 OID 16769)
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- TOC entry 1978 (class 1247 OID 16963)
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- TOC entry 2002 (class 1247 OID 17130)
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- TOC entry 1987 (class 1247 OID 17006)
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- TOC entry 1990 (class 1247 OID 17021)
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- TOC entry 2008 (class 1247 OID 17172)
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- TOC entry 2005 (class 1247 OID 17143)
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- TOC entry 2023 (class 1247 OID 17308)
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


--
-- TOC entry 388 (class 1255 OID 16538)
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- TOC entry 5484 (class 0 OID 0)
-- Dependencies: 388
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- TOC entry 407 (class 1255 OID 16751)
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- TOC entry 387 (class 1255 OID 16537)
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- TOC entry 5485 (class 0 OID 0)
-- Dependencies: 387
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- TOC entry 386 (class 1255 OID 16536)
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- TOC entry 5486 (class 0 OID 0)
-- Dependencies: 386
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- TOC entry 389 (class 1255 OID 16595)
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- TOC entry 5487 (class 0 OID 0)
-- Dependencies: 389
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- TOC entry 393 (class 1255 OID 16616)
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- TOC entry 5488 (class 0 OID 0)
-- Dependencies: 393
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- TOC entry 390 (class 1255 OID 16597)
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- TOC entry 5489 (class 0 OID 0)
-- Dependencies: 390
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- TOC entry 391 (class 1255 OID 16607)
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- TOC entry 392 (class 1255 OID 16608)
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- TOC entry 394 (class 1255 OID 16618)
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- TOC entry 5490 (class 0 OID 0)
-- Dependencies: 394
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- TOC entry 336 (class 1255 OID 16387)
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- TOC entry 1274 (class 1255 OID 18934)
-- Name: check_low_stock(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_low_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- 재고가 안전재고 이하로 떨어졌을 때 알림 생성
    IF NEW.stock_quantity <= NEW.safety_stock AND OLD.stock_quantity > OLD.safety_stock THEN
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority
        ) VALUES (
            (SELECT owner_id FROM stores WHERE id = NEW.store_id),
            'low_stock',
            '재고 부족 알림',
            '상품 "' || (SELECT name FROM products WHERE id = NEW.product_id) || '"의 재고가 부족합니다.',
            jsonb_build_object(
                'store_id', NEW.store_id,
                'product_id', NEW.product_id,
                'current_stock', NEW.stock_quantity,
                'safety_stock', NEW.safety_stock
            ),
            'high'
        );
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- TOC entry 1269 (class 1255 OID 18929)
-- Name: generate_order_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_order_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_number TEXT;
    date_part TEXT;
    counter INTEGER := 1;
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        date_part := TO_CHAR(NOW(), 'YYYYMMDD');
        
        -- 중복 방지를 위한 루프
        LOOP
            new_number := 'ORD-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
            
            -- 해당 번호가 이미 존재하는지 확인
            IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN
                NEW.order_number := new_number;
                EXIT;
            END IF;
            
            counter := counter + 1;
            
            -- 무한 루프 방지
            IF counter > 9999 THEN
                RAISE EXCEPTION '주문 번호 생성 실패: 최대 시도 횟수 초과';
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- TOC entry 1271 (class 1255 OID 18931)
-- Name: generate_shipment_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_shipment_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_number TEXT;
    date_part TEXT;
    counter INTEGER := 1;
BEGIN
    IF NEW.shipment_number IS NULL OR NEW.shipment_number = '' THEN
        date_part := TO_CHAR(NOW(), 'YYYYMMDD');
        
        -- 중복 방지를 위한 루프
        LOOP
            new_number := 'SHIP-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
            
            -- 해당 번호가 이미 존재하는지 확인
            IF NOT EXISTS (SELECT 1 FROM shipments WHERE shipment_number = new_number) THEN
                NEW.shipment_number := new_number;
                EXIT;
            END IF;
            
            counter := counter + 1;
            
            -- 무한 루프 방지
            IF counter > 9999 THEN
                RAISE EXCEPTION '배송 번호 생성 실패: 최대 시도 횟수 초과';
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- TOC entry 1270 (class 1255 OID 18930)
-- Name: generate_supply_request_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_supply_request_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_number TEXT;
    date_part TEXT;
    counter INTEGER := 1;
BEGIN
    IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
        date_part := TO_CHAR(NOW(), 'YYYYMMDD');
        
        -- 중복 방지를 위한 루프
        LOOP
            new_number := 'SUP-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
            
            -- 해당 번호가 이미 존재하는지 확인
            IF NOT EXISTS (SELECT 1 FROM supply_requests WHERE request_number = new_number) THEN
                NEW.request_number := new_number;
                EXIT;
            END IF;
            
            counter := counter + 1;
            
            -- 무한 루프 방지
            IF counter > 9999 THEN
                RAISE EXCEPTION '물류 요청 번호 생성 실패: 최대 시도 횟수 초과';
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- TOC entry 1284 (class 1255 OID 19036)
-- Name: get_product_rankings(date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_product_rankings(start_date date DEFAULT (CURRENT_DATE - '30 days'::interval), end_date date DEFAULT CURRENT_DATE) RETURNS TABLE(product_id uuid, product_name text, category_name text, total_sold bigint, total_revenue numeric, avg_price numeric, rank_position bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as product_id,
        p.name as product_name,
        c.name as category_name,
        COUNT(oi.id)::BIGINT as total_sold,
        COALESCE(SUM(oi.subtotal), 0) as total_revenue,
        COALESCE(AVG(oi.unit_price), 0) as avg_price,
        RANK() OVER (ORDER BY COALESCE(SUM(oi.subtotal), 0) DESC) as rank_position
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id 
        AND o.status = 'completed'
        AND DATE(o.created_at) BETWEEN start_date AND end_date
    GROUP BY p.id, p.name, c.name
    ORDER BY total_revenue DESC;
END;
$$;


--
-- TOC entry 1282 (class 1255 OID 19034)
-- Name: get_sales_summary(date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_sales_summary(start_date date DEFAULT (CURRENT_DATE - '30 days'::interval), end_date date DEFAULT CURRENT_DATE) RETURNS TABLE(total_orders bigint, completed_orders bigint, cancelled_orders bigint, total_revenue numeric, avg_order_value numeric, pickup_orders bigint, delivery_orders bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_orders,
        COUNT(CASE WHEN o.status = 'completed' THEN 1 END)::BIGINT as completed_orders,
        COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END)::BIGINT as cancelled_orders,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END), 0) as avg_order_value,
        COUNT(CASE WHEN o.type = 'pickup' THEN 1 END)::BIGINT as pickup_orders,
        COUNT(CASE WHEN o.type = 'delivery' THEN 1 END)::BIGINT as delivery_orders
    FROM orders o
    WHERE DATE(o.created_at) BETWEEN start_date AND end_date;
END;
$$;


--
-- TOC entry 1283 (class 1255 OID 19035)
-- Name: get_store_rankings(date, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_store_rankings(start_date date DEFAULT (CURRENT_DATE - '30 days'::interval), end_date date DEFAULT CURRENT_DATE) RETURNS TABLE(store_id uuid, store_name text, total_revenue numeric, total_orders bigint, avg_order_value numeric, rank_position bigint)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as store_id,
        s.name as store_name,
        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(o.id)::BIGINT as total_orders,
        COALESCE(AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END), 0) as avg_order_value,
        RANK() OVER (ORDER BY COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) DESC) as rank_position
    FROM stores s
    LEFT JOIN orders o ON s.id = o.store_id 
        AND DATE(o.created_at) BETWEEN start_date AND end_date
    GROUP BY s.id, s.name
    ORDER BY total_revenue DESC;
END;
$$;


--
-- TOC entry 1275 (class 1255 OID 18935)
-- Name: handle_order_completion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_order_completion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    order_item RECORD;
    store_name TEXT;
BEGIN
    -- 주문이 완료 상태로 변경될 때만 실행
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- 지점명 조회
        SELECT name INTO store_name FROM stores WHERE id = NEW.store_id;
        
        -- 고객에게 주문 완료 알림 생성
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            data,
            priority
        ) VALUES (
            NEW.customer_id,
            'order_completed',
            '주문이 완료되었습니다',
            '주문번호 ' || NEW.order_number || '의 준비가 완료되었습니다. ' || COALESCE(store_name, '지점') || '에서 픽업 가능합니다.',
            jsonb_build_object(
                'order_id', NEW.id,
                'order_number', NEW.order_number,
                'store_id', NEW.store_id,
                'store_name', COALESCE(store_name, '지점')
            ),
            'high'
        );
        
        -- 주문 아이템들을 순회하며 재고 차감
        FOR order_item IN 
            SELECT oi.product_id, oi.quantity, sp.id as store_product_id
            FROM order_items oi
            LEFT JOIN store_products sp ON sp.store_id = NEW.store_id AND sp.product_id = oi.product_id
            WHERE oi.order_id = NEW.id
        LOOP
            -- 재고가 있는 경우에만 차감
            IF order_item.store_product_id IS NOT NULL THEN
                -- 재고 차감
                UPDATE store_products 
                SET stock_quantity = GREATEST(0, stock_quantity - order_item.quantity),
                    updated_at = NOW()
                WHERE id = order_item.store_product_id;
                
                -- 재고 이력 기록
                INSERT INTO inventory_transactions (
                    store_product_id,
                    transaction_type,
                    quantity,
                    previous_quantity,
                    new_quantity,
                    reference_type,
                    reference_id,
                    reason,
                    created_by
                ) VALUES (
                    order_item.store_product_id,
                    'out',
                    order_item.quantity,
                    (SELECT stock_quantity + order_item.quantity FROM store_products WHERE id = order_item.store_product_id),
                    (SELECT stock_quantity FROM store_products WHERE id = order_item.store_product_id),
                    'order',
                    NEW.id,
                    '주문 완료로 인한 재고 차감',
                    NEW.customer_id
                );
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- TOC entry 1276 (class 1255 OID 18936)
-- Name: handle_shipment_delivery(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_shipment_delivery() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    request_item RECORD;
    store_product_id UUID;
BEGIN
    -- 배송이 완료 상태로 변경될 때만 실행
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        -- 물류 요청 아이템들을 순회하며 재고 증가
        FOR request_item IN 
            SELECT sri.product_id, sri.approved_quantity, sr.store_id
            FROM supply_request_items sri
            JOIN supply_requests sr ON sr.id = sri.supply_request_id
            WHERE sr.id = NEW.supply_request_id AND sri.approved_quantity > 0
        LOOP
            -- store_products에서 해당 상품의 ID 조회
            SELECT id INTO store_product_id 
            FROM store_products 
            WHERE store_id = request_item.store_id AND product_id = request_item.product_id;
            
            IF store_product_id IS NOT NULL THEN
                -- 재고 증가
                UPDATE store_products 
                SET stock_quantity = stock_quantity + request_item.approved_quantity,
                    updated_at = NOW()
                WHERE id = store_product_id;
                
                -- 재고 이력 기록
                INSERT INTO inventory_transactions (
                    store_product_id,
                    transaction_type,
                    quantity,
                    previous_quantity,
                    new_quantity,
                    reference_type,
                    reference_id,
                    reason,
                    created_by
                ) VALUES (
                    store_product_id,
                    'in',
                    request_item.approved_quantity,
                    (SELECT stock_quantity - request_item.approved_quantity FROM store_products WHERE id = store_product_id),
                    (SELECT stock_quantity FROM store_products WHERE id = store_product_id),
                    'supply_request',
                    NEW.supply_request_id,
                    '물류 배송 완료로 인한 재고 증가',
                    NEW.id
                );
            END IF;
        END LOOP;
        
        -- 물류 요청 상태를 delivered로 업데이트
        UPDATE supply_requests 
        SET status = 'delivered',
            actual_delivery_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE id = NEW.supply_request_id;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- TOC entry 1273 (class 1255 OID 18933)
-- Name: initialize_store_products(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.initialize_store_products() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- 새로 생성된 지점에 대해 모든 활성 상품에 대한 초기 재고 레코드 생성
    INSERT INTO store_products (store_id, product_id, price, stock_quantity, is_available)
    SELECT 
        NEW.id as store_id,
        p.id as product_id,
        p.base_price as price,
        0 as stock_quantity,  -- 초기 재고는 0개
        true as is_available
    FROM products p
    WHERE p.is_active = true
    AND NOT EXISTS (
        SELECT 1 FROM store_products sp 
        WHERE sp.store_id = NEW.id AND sp.product_id = p.id
    );
    
    RETURN NEW;
END;
$$;


--
-- TOC entry 1272 (class 1255 OID 18932)
-- Name: log_order_status_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_order_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, status, changed_by, notes)
        VALUES (NEW.id, NEW.status, auth.uid(), 'Status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status);
    END IF;
    RETURN NEW;
END;
$$;


--
-- TOC entry 1279 (class 1255 OID 18939)
-- Name: prevent_duplicate_orders(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_duplicate_orders() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    existing_order_id UUID;
    payment_key TEXT;
BEGIN
    -- payment_data에서 paymentKey 추출
    payment_key := NEW.payment_data->>'paymentKey';
    
    -- paymentKey가 있는 경우에만 중복 검사
    IF payment_key IS NOT NULL AND payment_key != '' THEN
        -- 같은 paymentKey를 가진 주문이 이미 있는지 확인
        SELECT id INTO existing_order_id
        FROM orders 
        WHERE payment_data->>'paymentKey' = payment_key
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
        LIMIT 1;
        
        -- 중복 주문이 발견되면 에러 발생
        IF existing_order_id IS NOT NULL THEN
            RAISE EXCEPTION '중복 주문이 감지되었습니다. PaymentKey: %', payment_key;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- TOC entry 1286 (class 1255 OID 19380)
-- Name: toggle_wishlist(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.toggle_wishlist(product_id_param uuid, user_id_param uuid) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    is_wishlisted BOOLEAN;
BEGIN
    -- 현재 찜 상태 확인
    SELECT EXISTS (
        SELECT 1 
        FROM product_wishlists 
        WHERE product_id = product_id_param 
        AND user_id = user_id_param
    ) INTO is_wishlisted;

    IF is_wishlisted THEN
        -- 찜 취소
        DELETE FROM product_wishlists 
        WHERE product_id = product_id_param 
        AND user_id = user_id_param;
        
        -- 찜 카운트 감소
        UPDATE products 
        SET wishlist_count = wishlist_count - 1
        WHERE id = product_id_param;
        
        RETURN false;
    ELSE
        -- 찜하기
        INSERT INTO product_wishlists (product_id, user_id)
        VALUES (product_id_param, user_id_param);
        
        -- 찜 카운트 증가
        UPDATE products 
        SET wishlist_count = wishlist_count + 1
        WHERE id = product_id_param;
        
        RETURN true;
    END IF;
END;
$$;


--
-- TOC entry 1277 (class 1255 OID 18937)
-- Name: update_inventory_on_supply_delivery(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_inventory_on_supply_delivery() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    supply_item RECORD;
BEGIN
    -- 물류 요청이 배송 완료 상태로 변경되었을 때만 실행
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        -- 물류 요청 상품들의 재고를 증가
        FOR supply_item IN 
            SELECT sri.product_id, sri.approved_quantity, sr.store_id
            FROM public.supply_request_items sri
            JOIN public.supply_requests sr ON sri.supply_request_id = sr.id
            WHERE sri.supply_request_id = NEW.id
                AND sri.approved_quantity > 0
        LOOP
            -- store_products 테이블의 재고 증가 (RLS 우회)
            UPDATE public.store_products 
            SET stock_quantity = stock_quantity + supply_item.approved_quantity,
                updated_at = NOW()
            WHERE store_id = supply_item.store_id 
                AND product_id = supply_item.product_id;
            
            -- 재고 거래 이력 기록 (RLS 우회)
            INSERT INTO public.inventory_transactions (
                store_product_id,
                transaction_type,
                quantity,
                previous_quantity,
                new_quantity,
                reference_type,
                reference_id,
                reason,
                created_by
            )
            SELECT 
                sp.id,
                'in',
                supply_item.approved_quantity,
                sp.stock_quantity - supply_item.approved_quantity,
                sp.stock_quantity,
                'supply_request',
                NEW.id,
                '물류 요청 배송 완료로 인한 재고 증가',
                NEW.requested_by
            FROM public.store_products sp
            WHERE sp.store_id = supply_item.store_id 
                AND sp.product_id = supply_item.product_id;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- TOC entry 1278 (class 1255 OID 18938)
-- Name: update_store_product_stock(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_store_product_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE store_products 
    SET stock_quantity = NEW.new_quantity,
        updated_at = NOW()
    WHERE id = NEW.store_product_id;
    
    RETURN NEW;
END;
$$;


--
-- TOC entry 1285 (class 1255 OID 19228)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- TOC entry 1281 (class 1255 OID 18941)
-- Name: validate_order_service(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_order_service() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- 지점의 서비스 가능 여부 검증
    IF NOT validate_store_service(NEW.store_id, NEW.type) THEN
        RAISE EXCEPTION '선택한 지점에서 % 서비스를 이용할 수 없습니다.', 
            CASE NEW.type 
                WHEN 'delivery' THEN '배송'
                WHEN 'pickup' THEN '픽업'
                ELSE NEW.type
            END;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- TOC entry 1280 (class 1255 OID 18940)
-- Name: validate_store_service(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.validate_store_service(p_store_id uuid, p_service_type text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    store_record RECORD;
BEGIN
    -- 지점 정보 조회
    SELECT 
        is_active,
        delivery_available,
        pickup_available
    INTO store_record
    FROM stores
    WHERE id = p_store_id;
    
    -- 지점이 존재하지 않거나 비활성화된 경우
    IF NOT FOUND OR NOT store_record.is_active THEN
        RETURN FALSE;
    END IF;
    
    -- 서비스 타입에 따른 검증
    CASE p_service_type
        WHEN 'delivery' THEN
            RETURN store_record.delivery_available;
        WHEN 'pickup' THEN
            RETURN store_record.pickup_available;
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$;


--
-- TOC entry 422 (class 1255 OID 17165)
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- TOC entry 428 (class 1255 OID 17248)
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- TOC entry 424 (class 1255 OID 17181)
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- TOC entry 420 (class 1255 OID 17127)
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- TOC entry 419 (class 1255 OID 17122)
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- TOC entry 423 (class 1255 OID 17173)
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- TOC entry 425 (class 1255 OID 17188)
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- TOC entry 418 (class 1255 OID 17121)
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- TOC entry 427 (class 1255 OID 17247)
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- TOC entry 417 (class 1255 OID 17119)
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- TOC entry 421 (class 1255 OID 17154)
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- TOC entry 426 (class 1255 OID 17241)
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- TOC entry 432 (class 1255 OID 17286)
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- TOC entry 413 (class 1255 OID 17063)
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- TOC entry 433 (class 1255 OID 17287)
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- TOC entry 436 (class 1255 OID 17290)
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- TOC entry 442 (class 1255 OID 17305)
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- TOC entry 410 (class 1255 OID 17024)
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- TOC entry 409 (class 1255 OID 17023)
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- TOC entry 408 (class 1255 OID 17022)
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- TOC entry 429 (class 1255 OID 17268)
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- TOC entry 430 (class 1255 OID 17284)
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- TOC entry 431 (class 1255 OID 17285)
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- TOC entry 440 (class 1255 OID 17303)
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- TOC entry 415 (class 1255 OID 17102)
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- TOC entry 414 (class 1255 OID 17065)
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- TOC entry 435 (class 1255 OID 17289)
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- TOC entry 441 (class 1255 OID 17304)
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- TOC entry 416 (class 1255 OID 17118)
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- TOC entry 434 (class 1255 OID 17288)
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- TOC entry 411 (class 1255 OID 17052)
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- TOC entry 439 (class 1255 OID 17301)
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- TOC entry 438 (class 1255 OID 17300)
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- TOC entry 437 (class 1255 OID 17295)
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


--
-- TOC entry 412 (class 1255 OID 17053)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 254 (class 1259 OID 16523)
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- TOC entry 5491 (class 0 OID 0)
-- Dependencies: 254
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- TOC entry 271 (class 1259 OID 16925)
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- TOC entry 5492 (class 0 OID 0)
-- Dependencies: 271
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- TOC entry 262 (class 1259 OID 16723)
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 5493 (class 0 OID 0)
-- Dependencies: 262
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- TOC entry 5494 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- TOC entry 253 (class 1259 OID 16516)
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- TOC entry 5495 (class 0 OID 0)
-- Dependencies: 253
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- TOC entry 266 (class 1259 OID 16812)
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- TOC entry 5496 (class 0 OID 0)
-- Dependencies: 266
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- TOC entry 265 (class 1259 OID 16800)
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- TOC entry 5497 (class 0 OID 0)
-- Dependencies: 265
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- TOC entry 264 (class 1259 OID 16787)
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- TOC entry 5498 (class 0 OID 0)
-- Dependencies: 264
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- TOC entry 272 (class 1259 OID 16975)
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- TOC entry 252 (class 1259 OID 16505)
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- TOC entry 5499 (class 0 OID 0)
-- Dependencies: 252
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- TOC entry 251 (class 1259 OID 16504)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 5500 (class 0 OID 0)
-- Dependencies: 251
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- TOC entry 269 (class 1259 OID 16854)
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- TOC entry 5501 (class 0 OID 0)
-- Dependencies: 269
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- TOC entry 270 (class 1259 OID 16872)
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- TOC entry 5502 (class 0 OID 0)
-- Dependencies: 270
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- TOC entry 255 (class 1259 OID 16531)
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- TOC entry 5503 (class 0 OID 0)
-- Dependencies: 255
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- TOC entry 263 (class 1259 OID 16753)
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- TOC entry 5504 (class 0 OID 0)
-- Dependencies: 263
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- TOC entry 5505 (class 0 OID 0)
-- Dependencies: 263
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- TOC entry 268 (class 1259 OID 16839)
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- TOC entry 5506 (class 0 OID 0)
-- Dependencies: 268
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- TOC entry 267 (class 1259 OID 16830)
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- TOC entry 5507 (class 0 OID 0)
-- Dependencies: 267
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- TOC entry 5508 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- TOC entry 250 (class 1259 OID 16493)
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- TOC entry 5509 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- TOC entry 5510 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- TOC entry 296 (class 1259 OID 18567)
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    parent_id uuid,
    icon_url text,
    description text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 300 (class 1259 OID 18659)
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number text NOT NULL,
    customer_id uuid,
    store_id uuid,
    type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    subtotal numeric DEFAULT 0 NOT NULL,
    tax_amount numeric DEFAULT 0 NOT NULL,
    delivery_fee numeric DEFAULT 0,
    discount_amount numeric DEFAULT 0,
    total_amount numeric DEFAULT 0 NOT NULL,
    delivery_address jsonb,
    delivery_notes text,
    payment_method text,
    payment_status text DEFAULT 'pending'::text,
    payment_data jsonb DEFAULT '{}'::jsonb,
    pickup_time timestamp with time zone,
    estimated_preparation_time integer DEFAULT 0,
    completed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    notes text,
    cancel_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT orders_payment_method_check CHECK ((payment_method = ANY (ARRAY['card'::text, 'cash'::text, 'kakao_pay'::text, 'toss_pay'::text, 'naver_pay'::text]))),
    CONSTRAINT orders_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'refunded'::text, 'failed'::text]))),
    CONSTRAINT orders_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'preparing'::text, 'ready'::text, 'completed'::text, 'cancelled'::text]))),
    CONSTRAINT orders_type_check CHECK ((type = ANY (ARRAY['pickup'::text, 'delivery'::text])))
);


--
-- TOC entry 311 (class 1259 OID 19010)
-- Name: daily_sales_analytics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.daily_sales_analytics AS
 SELECT date(created_at) AS sale_date,
    count(*) AS total_orders,
    count(
        CASE
            WHEN (status = 'completed'::text) THEN 1
            ELSE NULL::integer
        END) AS completed_orders,
    count(
        CASE
            WHEN (status = 'cancelled'::text) THEN 1
            ELSE NULL::integer
        END) AS cancelled_orders,
    sum(
        CASE
            WHEN (status = 'completed'::text) THEN total_amount
            ELSE (0)::numeric
        END) AS total_revenue,
    avg(
        CASE
            WHEN (status = 'completed'::text) THEN total_amount
            ELSE NULL::numeric
        END) AS avg_order_value,
    count(
        CASE
            WHEN (type = 'pickup'::text) THEN 1
            ELSE NULL::integer
        END) AS pickup_orders,
    count(
        CASE
            WHEN (type = 'delivery'::text) THEN 1
            ELSE NULL::integer
        END) AS delivery_orders
   FROM public.orders o
  GROUP BY (date(created_at))
  ORDER BY (date(created_at)) DESC;


--
-- TOC entry 302 (class 1259 OID 18716)
-- Name: daily_sales_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_sales_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid,
    date date NOT NULL,
    total_orders integer DEFAULT 0,
    pickup_orders integer DEFAULT 0,
    delivery_orders integer DEFAULT 0,
    cancelled_orders integer DEFAULT 0,
    total_revenue numeric DEFAULT 0,
    total_items_sold integer DEFAULT 0,
    avg_order_value numeric DEFAULT 0,
    hourly_stats jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 314 (class 1259 OID 19025)
-- Name: hourly_sales_analytics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.hourly_sales_analytics AS
 SELECT EXTRACT(hour FROM created_at) AS hour_of_day,
    count(*) AS total_orders,
    sum(
        CASE
            WHEN (status = 'completed'::text) THEN total_amount
            ELSE (0)::numeric
        END) AS total_revenue,
    avg(
        CASE
            WHEN (status = 'completed'::text) THEN total_amount
            ELSE NULL::numeric
        END) AS avg_order_value
   FROM public.orders o
  GROUP BY (EXTRACT(hour FROM created_at))
  ORDER BY (EXTRACT(hour FROM created_at));


--
-- TOC entry 305 (class 1259 OID 18780)
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_product_id uuid,
    transaction_type text NOT NULL,
    quantity integer NOT NULL,
    previous_quantity integer NOT NULL,
    new_quantity integer NOT NULL,
    reference_type text,
    reference_id uuid,
    unit_cost numeric DEFAULT 0,
    total_cost numeric DEFAULT 0,
    reason text,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT inventory_transactions_transaction_type_check CHECK ((transaction_type = ANY (ARRAY['in'::text, 'out'::text, 'adjustment'::text, 'expired'::text, 'damaged'::text, 'returned'::text])))
);


--
-- TOC entry 309 (class 1259 OID 18879)
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    priority text DEFAULT 'normal'::text,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT notifications_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text])))
);


--
-- TOC entry 301 (class 1259 OID 18694)
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    product_id uuid,
    product_name text NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric NOT NULL,
    discount_amount numeric DEFAULT 0,
    subtotal numeric NOT NULL,
    options jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);


--
-- TOC entry 304 (class 1259 OID 18761)
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    status text NOT NULL,
    changed_by uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 315 (class 1259 OID 19029)
-- Name: payment_method_analytics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.payment_method_analytics AS
 SELECT payment_method,
    count(*) AS total_orders,
    sum(
        CASE
            WHEN (status = 'completed'::text) THEN total_amount
            ELSE (0)::numeric
        END) AS total_revenue,
    avg(
        CASE
            WHEN (status = 'completed'::text) THEN total_amount
            ELSE NULL::numeric
        END) AS avg_order_value,
    count(
        CASE
            WHEN (payment_status = 'paid'::text) THEN 1
            ELSE NULL::integer
        END) AS paid_orders,
    count(
        CASE
            WHEN (payment_status = 'failed'::text) THEN 1
            ELSE NULL::integer
        END) AS failed_orders
   FROM public.orders o
  GROUP BY payment_method
  ORDER BY (sum(
        CASE
            WHEN (status = 'completed'::text) THEN total_amount
            ELSE (0)::numeric
        END)) DESC;


--
-- TOC entry 297 (class 1259 OID 18588)
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    barcode text,
    category_id uuid,
    brand text,
    manufacturer text,
    unit text DEFAULT '개'::text NOT NULL,
    image_urls text[] DEFAULT '{}'::text[],
    base_price numeric NOT NULL,
    cost_price numeric,
    tax_rate numeric DEFAULT 0.10,
    is_active boolean DEFAULT true,
    requires_preparation boolean DEFAULT false,
    preparation_time integer DEFAULT 0,
    nutritional_info jsonb DEFAULT '{}'::jsonb,
    allergen_info text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_wishlisted boolean DEFAULT false,
    wishlist_count integer DEFAULT 0
);


--
-- TOC entry 313 (class 1259 OID 19020)
-- Name: product_sales_analytics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.product_sales_analytics AS
 SELECT p.id AS product_id,
    p.name AS product_name,
    c.name AS category_name,
    count(oi.id) AS total_sold,
    sum(oi.subtotal) AS total_revenue,
    avg(oi.unit_price) AS avg_price,
    count(DISTINCT o.id) AS order_count
   FROM (((public.products p
     LEFT JOIN public.categories c ON ((p.category_id = c.id)))
     LEFT JOIN public.order_items oi ON ((p.id = oi.product_id)))
     LEFT JOIN public.orders o ON (((oi.order_id = o.id) AND (o.status = 'completed'::text))))
  GROUP BY p.id, p.name, c.name
  ORDER BY (sum(oi.subtotal)) DESC;


--
-- TOC entry 303 (class 1259 OID 18739)
-- Name: product_sales_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_sales_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid,
    product_id uuid,
    date date NOT NULL,
    quantity_sold integer DEFAULT 0,
    revenue numeric DEFAULT 0,
    avg_price numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 324 (class 1259 OID 19381)
-- Name: product_wishlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_wishlists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 295 (class 1259 OID 18555)
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    role text NOT NULL,
    full_name text NOT NULL,
    phone text,
    avatar_url text,
    address jsonb,
    preferences jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['customer'::text, 'store_owner'::text, 'headquarters'::text])))
);


--
-- TOC entry 308 (class 1259 OID 18860)
-- Name: shipments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shipment_number text NOT NULL,
    supply_request_id uuid,
    status text DEFAULT 'preparing'::text NOT NULL,
    carrier text,
    tracking_number text,
    shipped_at timestamp with time zone,
    estimated_delivery timestamp with time zone,
    delivered_at timestamp with time zone,
    notes text,
    failure_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT shipments_status_check CHECK ((status = ANY (ARRAY['preparing'::text, 'shipped'::text, 'in_transit'::text, 'delivered'::text, 'failed'::text])))
);


--
-- TOC entry 299 (class 1259 OID 18634)
-- Name: store_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.store_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    store_id uuid,
    product_id uuid,
    price numeric NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    safety_stock integer DEFAULT 10,
    max_stock integer DEFAULT 100,
    is_available boolean DEFAULT true,
    discount_rate numeric DEFAULT 0,
    promotion_start_date timestamp with time zone,
    promotion_end_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 298 (class 1259 OID 18612)
-- Name: stores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    owner_id uuid,
    address text NOT NULL,
    phone text NOT NULL,
    business_hours jsonb DEFAULT '{}'::jsonb NOT NULL,
    location public.geography(Point,4326),
    delivery_available boolean DEFAULT true,
    pickup_available boolean DEFAULT true,
    delivery_radius integer DEFAULT 3000,
    min_order_amount numeric DEFAULT 0,
    delivery_fee numeric DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 312 (class 1259 OID 19015)
-- Name: store_sales_analytics; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.store_sales_analytics AS
 SELECT s.id AS store_id,
    s.name AS store_name,
    count(o.id) AS total_orders,
    count(
        CASE
            WHEN (o.status = 'completed'::text) THEN 1
            ELSE NULL::integer
        END) AS completed_orders,
    sum(
        CASE
            WHEN (o.status = 'completed'::text) THEN o.total_amount
            ELSE (0)::numeric
        END) AS total_revenue,
    avg(
        CASE
            WHEN (o.status = 'completed'::text) THEN o.total_amount
            ELSE NULL::numeric
        END) AS avg_order_value,
    count(
        CASE
            WHEN (o.type = 'pickup'::text) THEN 1
            ELSE NULL::integer
        END) AS pickup_orders,
    count(
        CASE
            WHEN (o.type = 'delivery'::text) THEN 1
            ELSE NULL::integer
        END) AS delivery_orders,
    max(o.created_at) AS last_order_date
   FROM (public.stores s
     LEFT JOIN public.orders o ON ((s.id = o.store_id)))
  GROUP BY s.id, s.name
  ORDER BY (sum(
        CASE
            WHEN (o.status = 'completed'::text) THEN o.total_amount
            ELSE (0)::numeric
        END)) DESC;


--
-- TOC entry 307 (class 1259 OID 18835)
-- Name: supply_request_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supply_request_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    supply_request_id uuid,
    product_id uuid,
    product_name text NOT NULL,
    requested_quantity integer NOT NULL,
    approved_quantity integer DEFAULT 0,
    unit_cost numeric DEFAULT 0,
    total_cost numeric DEFAULT 0,
    reason text,
    current_stock integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT supply_request_items_approved_quantity_check CHECK ((approved_quantity >= 0)),
    CONSTRAINT supply_request_items_requested_quantity_check CHECK ((requested_quantity > 0))
);


--
-- TOC entry 306 (class 1259 OID 18802)
-- Name: supply_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supply_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_number text NOT NULL,
    store_id uuid,
    requested_by uuid,
    status text DEFAULT 'draft'::text NOT NULL,
    priority text DEFAULT 'normal'::text,
    total_amount numeric DEFAULT 0,
    approved_amount numeric DEFAULT 0,
    expected_delivery_date date,
    actual_delivery_date date,
    approved_by uuid,
    approved_at timestamp with time zone,
    notes text,
    rejection_reason text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT supply_requests_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT supply_requests_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'approved'::text, 'rejected'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text])))
);


--
-- TOC entry 310 (class 1259 OID 18897)
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    description text,
    category text DEFAULT 'general'::text,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 323 (class 1259 OID 19286)
-- Name: wishlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wishlists (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL
);


--
-- TOC entry 281 (class 1259 OID 17251)
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- TOC entry 316 (class 1259 OID 19091)
-- Name: messages_2025_08_06; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_06 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 317 (class 1259 OID 19102)
-- Name: messages_2025_08_07; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_07 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 318 (class 1259 OID 19113)
-- Name: messages_2025_08_08; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_08 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 319 (class 1259 OID 19124)
-- Name: messages_2025_08_09; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_09 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 320 (class 1259 OID 19135)
-- Name: messages_2025_08_10; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_08_10 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- TOC entry 273 (class 1259 OID 17000)
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- TOC entry 276 (class 1259 OID 17032)
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- TOC entry 275 (class 1259 OID 17031)
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 256 (class 1259 OID 16544)
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- TOC entry 5511 (class 0 OID 0)
-- Dependencies: 256
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 283 (class 1259 OID 17314)
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 258 (class 1259 OID 16586)
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 257 (class 1259 OID 16559)
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- TOC entry 5512 (class 0 OID 0)
-- Dependencies: 257
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 282 (class 1259 OID 17269)
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- TOC entry 277 (class 1259 OID 17067)
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- TOC entry 278 (class 1259 OID 17081)
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 321 (class 1259 OID 19172)
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text
);


--
-- TOC entry 322 (class 1259 OID 19179)
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- TOC entry 4675 (class 0 OID 0)
-- Name: messages_2025_08_06; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_06 FOR VALUES FROM ('2025-08-06 00:00:00') TO ('2025-08-07 00:00:00');


--
-- TOC entry 4676 (class 0 OID 0)
-- Name: messages_2025_08_07; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_07 FOR VALUES FROM ('2025-08-07 00:00:00') TO ('2025-08-08 00:00:00');


--
-- TOC entry 4677 (class 0 OID 0)
-- Name: messages_2025_08_08; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_08 FOR VALUES FROM ('2025-08-08 00:00:00') TO ('2025-08-09 00:00:00');


--
-- TOC entry 4678 (class 0 OID 0)
-- Name: messages_2025_08_09; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_09 FOR VALUES FROM ('2025-08-09 00:00:00') TO ('2025-08-10 00:00:00');


--
-- TOC entry 4679 (class 0 OID 0)
-- Name: messages_2025_08_10; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_08_10 FOR VALUES FROM ('2025-08-10 00:00:00') TO ('2025-08-11 00:00:00');


--
-- TOC entry 4689 (class 2604 OID 16508)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 5423 (class 0 OID 16523)
-- Dependencies: 254
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5437 (class 0 OID 16925)
-- Dependencies: 271
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5428 (class 0 OID 16723)
-- Dependencies: 262
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5422 (class 0 OID 16516)
-- Dependencies: 253
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5432 (class 0 OID 16812)
-- Dependencies: 266
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5431 (class 0 OID 16800)
-- Dependencies: 265
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5430 (class 0 OID 16787)
-- Dependencies: 264
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5438 (class 0 OID 16975)
-- Dependencies: 272
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5421 (class 0 OID 16505)
-- Dependencies: 252
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5435 (class 0 OID 16854)
-- Dependencies: 269
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5436 (class 0 OID 16872)
-- Dependencies: 270
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5424 (class 0 OID 16531)
-- Dependencies: 255
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5429 (class 0 OID 16753)
-- Dependencies: 263
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5434 (class 0 OID 16839)
-- Dependencies: 268
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5433 (class 0 OID 16830)
-- Dependencies: 267
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5419 (class 0 OID 16493)
-- Dependencies: 250
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--



--
-- TOC entry 5447 (class 0 OID 18567)
-- Dependencies: 296
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.categories (id, name, slug, parent_id, icon_url, description, display_order, is_active, created_at, updated_at) FROM stdin;
73d4851b-ef39-4385-af8b-438e9d7244dc	음료	beverages	\N	\N	다양한 음료 제품	1	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
d57deaea-48e5-44ac-8606-73562ac1b45e	식품	food	\N	\N	신선한 식품	2	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
d167d6b8-18d9-45e4-a487-71762b407338	간식	snacks	\N	\N	맛있는 간식	3	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
a802f358-8f16-45de-a142-d1e3b4771c1f	생활용품	household	\N	\N	일상 생활용품	4	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
b5322cda-11d3-4e25-bedf-715d3708e3f4	탄산음료	carbonated-drinks	\N	\N	시원하고 톡 쏘는 탄산음료	11	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
5f573c84-1285-4493-9d7e-5455cf224aa9	커피/차	coffee-tea	\N	\N	따뜻하고 향긋한 커피와 차	12	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
83a38d2c-23dc-42d2-a6a7-7b274b509c3b	우유/유제품	milk-dairy	\N	\N	신선한 우유와 유제품	13	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
4e7e4426-0e6e-4314-9ed7-370e10877e5e	주스/음료	juice-drinks	\N	\N	과일 주스와 건강 음료	14	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
4b7804d3-e72c-42b7-a496-6f78b08c9261	에너지음료	energy-drinks	\N	\N	활력을 주는 에너지 드링크	15	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
970b5bb1-f964-44ec-9ef6-7f61dee14ac7	즉석식품	instant-food	\N	\N	간편하게 먹을 수 있는 즉석식품	21	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
339a2537-982e-4fd4-94b2-49f691ce9d7f	라면/면류	noodles-ramen	\N	\N	다양한 라면과 면류 제품	22	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
faef2998-3ef8-4757-b98e-5f70e9882f30	냉동식품	frozen-food	\N	\N	신선하게 보관된 냉동식품	23	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
4b982efc-cd38-48c2-bd5d-2ede5cbd2933	빵/베이커리	bread-bakery	\N	\N	갓 구운 빵과 베이커리 제품	24	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
0b174648-179d-45d5-b506-f8f68dd7acd4	유제품/계란	dairy-eggs	\N	\N	신선한 유제품과 계란	25	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
664116df-2538-413b-97d1-8844f60685b2	과자/스낵	snacks-crackers	\N	\N	바삭하고 맛있는 과자류	31	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
7efa7627-fbd1-4fbd-9e63-7a4af2919c2b	초콜릿/사탕	chocolate-candy	\N	\N	달콤한 초콜릿과 사탕	32	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
58e85b7a-1e65-481b-b22d-6063153f60ee	아이스크림	ice-cream	\N	\N	시원하고 달콤한 아이스크림	33	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
3169991a-eac0-481e-80f1-2dc0d14ab893	견과류	nuts	\N	\N	건강한 견과류와 건과일	34	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
7a31e2b7-1e28-4388-af86-58abb31f0309	껌/젤리	gum-jelly	\N	\N	쫄깃한 껌과 젤리류	35	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
209d6e3a-fa7c-470c-b9b6-d6e55efa4e06	세제/청소용품	cleaning-supplies	\N	\N	깨끗한 생활을 위한 세제	41	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
ecc273ad-0551-4467-a934-35b516ecd95d	화장지/휴지	tissue-paper	\N	\N	부드러운 화장지와 휴지	42	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
c97a00b2-dd0d-40de-a063-a9aa674e69e3	개인위생용품	personal-hygiene	\N	\N	개인 위생을 위한 필수품	43	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
f3393913-492e-49ac-923b-60c3b0b9eb1c	화장품/미용	cosmetics-beauty	\N	\N	아름다운 생활을 위한 화장품	44	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
2bee79ee-bc71-48a9-bfb3-54ee61fd962c	의약품/건강	medicine-health	\N	\N	건강 관리를 위한 의약품	45	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
527b9a76-00ac-4dd2-9043-37213a1bd805	문구/사무용품	stationery-office	\N	\N	학습과 업무를 위한 문구류	50	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
7903184d-e487-4ac3-9d93-9feb61a99b38	전자제품/배터리	electronics-battery	\N	\N	편리한 전자제품과 배터리	60	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
25fb3349-7f7f-4fd8-b8e1-7e52b5878bfd	담배/주류	tobacco-alcohol	\N	\N	성인용 담배와 주류 제품	70	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
2d75954d-859f-445d-80ca-7baa6aa84596	반려동물용품	pet-supplies	\N	\N	사랑하는 반려동물을 위한 용품	80	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
5d7b6c0d-61f5-4b3b-aa3e-96144fd89941	자동차용품	car-supplies	\N	\N	자동차 관리를 위한 용품	90	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
\.


--
-- TOC entry 5453 (class 0 OID 18716)
-- Dependencies: 302
-- Data for Name: daily_sales_summary; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.daily_sales_summary (id, store_id, date, total_orders, pickup_orders, delivery_orders, cancelled_orders, total_revenue, total_items_sold, avg_order_value, hourly_stats, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5456 (class 0 OID 18780)
-- Dependencies: 305
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inventory_transactions (id, store_product_id, transaction_type, quantity, previous_quantity, new_quantity, reference_type, reference_id, unit_cost, total_cost, reason, notes, created_by, created_at) FROM stdin;
\.


--
-- TOC entry 5460 (class 0 OID 18879)
-- Dependencies: 309
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, message, data, priority, is_read, read_at, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 5452 (class 0 OID 18694)
-- Dependencies: 301
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, order_id, product_id, product_name, quantity, unit_price, discount_amount, subtotal, options, created_at) FROM stdin;
\.


--
-- TOC entry 5455 (class 0 OID 18761)
-- Dependencies: 304
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_status_history (id, order_id, status, changed_by, notes, created_at) FROM stdin;
\.


--
-- TOC entry 5451 (class 0 OID 18659)
-- Dependencies: 300
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, order_number, customer_id, store_id, type, status, subtotal, tax_amount, delivery_fee, discount_amount, total_amount, delivery_address, delivery_notes, payment_method, payment_status, payment_data, pickup_time, estimated_preparation_time, completed_at, cancelled_at, notes, cancel_reason, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5454 (class 0 OID 18739)
-- Dependencies: 303
-- Data for Name: product_sales_summary; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_sales_summary (id, store_id, product_id, date, quantity_sold, revenue, avg_price, created_at) FROM stdin;
\.


--
-- TOC entry 5470 (class 0 OID 19381)
-- Dependencies: 324
-- Data for Name: product_wishlists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.product_wishlists (id, product_id, user_id, created_at) FROM stdin;
\.


--
-- TOC entry 5448 (class 0 OID 18588)
-- Dependencies: 297
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, description, barcode, category_id, brand, manufacturer, unit, image_urls, base_price, cost_price, tax_rate, is_active, requires_preparation, preparation_time, nutritional_info, allergen_info, created_at, updated_at, is_wishlisted, wishlist_count) FROM stdin;
f305b043-d3ec-4dc8-ad66-f96d5f638e24	코카콜라 500ml	세계적으로 사랑받는 탄산음료	8801094000001	b5322cda-11d3-4e25-bedf-715d3708e3f4	코카콜라	한국 코카콜라	개	{}	2000	1200	0.10	t	f	0	{"지방": 0, "단백질": 0, "칼로리": 210, "탄수화물": 53}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
13ee4600-7120-460e-b79d-fcb2520bfe2b	농심 신라면 120g	한국의 대표적인 라면	8801043001010	339a2537-982e-4fd4-94b2-49f691ce9d7f	농심	농심	개	{}	1200	750	0.10	t	t	4	{"지방": 19, "단백질": 11, "칼로리": 520, "탄수화물": 77}	{글루텐,대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
f36cd26e-7f95-4ee5-8ce2-5d65fd0f8543	농심 새우깡 90g	바삭하고 고소한 새우깡	8801043011010	664116df-2538-413b-97d1-8844f60685b2	농심	농심	개	{}	1500	900	0.10	t	f	0	{"지방": 20, "단백질": 4, "칼로리": 320, "탄수화물": 32}	{갑각류}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
a1d78d34-fc02-47e5-bd0c-f0f47db05cff	코카콜라 350ml	세계적으로 사랑받는 탄산음료	8801094000011	b5322cda-11d3-4e25-bedf-715d3708e3f4	코카콜라	한국 코카콜라	개	{}	1800	1100	0.10	t	f	0	{"지방": 0, "단백질": 0, "칼로리": 140, "탄수화물": 37}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
b6f89e05-5d07-4024-8179-915f83ea62f1	펩시콜라 500ml	상쾌한 콜라의 진정한 맛	8801094000012	b5322cda-11d3-4e25-bedf-715d3708e3f4	펩시	롯데칠성음료	개	{}	2000	1200	0.10	t	f	0	{"지방": 0, "단백질": 0, "칼로리": 210, "탄수화물": 53}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
1c30a32b-f1cf-42f5-ac7f-b801c71dfae0	칠성사이다 500ml	청량한 사이다의 대명사	8801094000013	b5322cda-11d3-4e25-bedf-715d3708e3f4	칠성사이다	롯데칠성음료	개	{}	1800	1100	0.10	t	f	0	{"지방": 0, "단백질": 0, "칼로리": 190, "탄수화물": 48}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
bf1e6aff-e51a-4e4e-be41-000d381f3c18	스프라이트 500ml	레몬라임의 상쾌한 맛	8801094000014	b5322cda-11d3-4e25-bedf-715d3708e3f4	스프라이트	한국 코카콜라	개	{}	1800	1100	0.10	t	f	0	{"지방": 0, "단백질": 0, "칼로리": 180, "탄수화물": 45}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
5ef7943b-ac90-4a43-9918-3292507b59dd	환타 오렌지 500ml	달콤한 오렌지 맛 탄산음료	8801094000015	b5322cda-11d3-4e25-bedf-715d3708e3f4	환타	한국 코카콜라	개	{}	1800	1100	0.10	t	f	0	{"지방": 0, "단백질": 0, "칼로리": 200, "탄수화물": 50}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
c74e36db-08f8-4e3d-bd91-07db540d9d6a	마운틴듀 500ml	시트러스 맛의 에너지 넘치는 탄산음료	8801094000016	b5322cda-11d3-4e25-bedf-715d3708e3f4	마운틴듀	롯데칠성음료	개	{}	2000	1200	0.10	t	f	0	{"지방": 0, "단백질": 0, "칼로리": 220, "탄수화물": 55}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
0c3c92c2-0271-449b-875e-4ed0c0726dd8	맥심 오리지널 커피믹스	달콤하고 부드러운 커피믹스	8801094001011	5f573c84-1285-4493-9d7e-5455cf224aa9	맥심	동서식품	개	{}	12000	8000	0.10	t	f	0	{"지방": 2, "단백질": 1, "칼로리": 60, "탄수화물": 10}	{유제품}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
851c86e3-3bf5-467c-ae6a-acb511468d42	스타벅스 아메리카노 RTD	진짜 스타벅스 원두로 만든 아메리카노	8801094001012	5f573c84-1285-4493-9d7e-5455cf224aa9	스타벅스	롯데칠성음료	개	{}	3000	1800	0.10	t	f	0	{"지방": 0, "단백질": 1, "칼로리": 10, "탄수화물": 2}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
c4fb187d-488f-4a0c-9557-c9468363be14	TOP 아메리카노 275ml	원두의 깊은 맛이 살아있는 아메리카노	8801094001013	5f573c84-1285-4493-9d7e-5455cf224aa9	TOP	롯데칠성음료	개	{}	1500	900	0.10	t	f	0	{"지방": 0, "단백질": 0, "칼로리": 5, "탄수화물": 1}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
c2933746-49e3-4908-a733-c0b2f47b34fc	컨트리타임 아이스티	상큼한 레몬 아이스티	8801094001014	5f573c84-1285-4493-9d7e-5455cf224aa9	컨트리타임	롯데칠성음료	개	{}	1800	1100	0.10	t	f	0	{"지방": 0, "단백질": 0, "칼로리": 80, "탄수화물": 20}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
f29786be-a114-48c7-8fd7-acab64ad01db	립톤 아이스티 레몬	세계 1위 티 브랜드의 아이스티	8801094001015	5f573c84-1285-4493-9d7e-5455cf224aa9	립톤	유니레버코리아	개	{}	1900	1150	0.10	t	f	0	{"지방": 0, "단백질": 0, "칼로리": 90, "탄수화물": 22}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
4fad08c2-3e13-49db-a7ab-89a670b72f89	농심 짜파게티 140g	달콤짭짤한 짜장면의 맛	8801043001001	339a2537-982e-4fd4-94b2-49f691ce9d7f	농심	농심	개	{}	1300	800	0.10	t	t	4	{"지방": 22, "단백질": 12, "칼로리": 570, "탄수화물": 80}	{글루텐,대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
f698e6a3-9e81-438e-8781-0cf7ca4ce4ff	농심 너구리 120g	진한 다시마 육수의 우동	8801043001002	339a2537-982e-4fd4-94b2-49f691ce9d7f	농심	농심	개	{}	1200	750	0.10	t	t	4	{"지방": 18, "단백질": 10, "칼로리": 500, "탄수화물": 75}	{글루텐,대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
70d05ccd-165b-4365-be25-f48df80e139b	농심 안성탕면 125g	얼큰한 국물의 전통 라면	8801043001003	339a2537-982e-4fd4-94b2-49f691ce9d7f	농심	농심	개	{}	1200	750	0.10	t	t	4	{"지방": 19, "단백질": 11, "칼로리": 520, "탄수화물": 77}	{글루텐,대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
24244a8c-e72c-4539-98e8-8cd0b3b423f4	오뚜기 진라면 순한맛 120g	깔끔하고 순한 맛의 라면	8801043002001	339a2537-982e-4fd4-94b2-49f691ce9d7f	진라면	오뚜기	개	{}	1200	750	0.10	t	t	4	{"지방": 18, "단백질": 10, "칼로리": 510, "탄수화물": 76}	{글루텐,대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
24af4562-b99e-469a-8d12-c9bf9ec1c5a5	오뚜기 진라면 매운맛 120g	매콤한 맛이 일품인 라면	8801043002002	339a2537-982e-4fd4-94b2-49f691ce9d7f	진라면	오뚜기	개	{}	1200	750	0.10	t	t	4	{"지방": 18, "단백질": 10, "칼로리": 515, "탄수화물": 77}	{글루텐,대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
5f51f58a-4295-44a3-a6b1-bb7c8c9e9b5f	삼양 불닭볶음면 140g	매운 맛의 대명사 볶음면	8801043003001	339a2537-982e-4fd4-94b2-49f691ce9d7f	불닭볶음면	삼양식품	개	{}	1500	900	0.10	t	t	4	{"지방": 17, "단백질": 11, "칼로리": 530, "탄수화물": 80}	{글루텐,대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
dccf2fd7-0438-41e5-9eac-68c514e20e0e	팔도 비빔면 130g	새콤달콤 비빔면의 원조	8801043004001	339a2537-982e-4fd4-94b2-49f691ce9d7f	팔도비빔면	팔도	개	{}	1300	800	0.10	t	t	4	{"지방": 12, "단백질": 9, "칼로리": 490, "탄수화물": 85}	{글루텐,대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
ec67ec69-eec0-4ea3-b399-46a7e83824d5	농심 육개장사발면 86g	얼큰한 육개장 맛 컵라면	8801043001004	339a2537-982e-4fd4-94b2-49f691ce9d7f	농심	농심	개	{}	1400	850	0.10	t	t	3	{"지방": 13, "단백질": 7, "칼로리": 350, "탄수화물": 50}	{글루텐,대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
0f3c3891-2eb2-41da-9b51-b7f7c9c0c726	농심 새우탕면 75g	시원한 새우 국물 컵라면	8801043001005	339a2537-982e-4fd4-94b2-49f691ce9d7f	농심	농심	개	{}	1400	850	0.10	t	t	3	{"지방": 12, "단백질": 6, "칼로리": 320, "탄수화물": 45}	{글루텐,대두,갑각류}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
eecb4e27-0428-432c-bdd3-07239e370a85	농심 포테토칩 오리지널 60g	바삭한 감자칩의 정석	8801043011001	664116df-2538-413b-97d1-8844f60685b2	농심	농심	개	{}	1800	1100	0.10	t	f	0	{"지방": 20, "단백질": 4, "칼로리": 320, "탄수화물": 32}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
6f4328b8-d9dd-4026-8b6f-a5f305bbe69d	오리온 초코파이 360g	부드러운 마시멜로와 초콜릿의 조화	8801043012001	664116df-2538-413b-97d1-8844f60685b2	초코파이	오리온	개	{}	3500	2200	0.10	t	f	0	{"지방": 22, "단백질": 5, "칼로리": 480, "탄수화물": 65}	{글루텐,계란,유제품}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
f0bd0b30-092c-4856-83f4-d8648b9fbf8e	롯데 빼빼로 오리지널 47g	아삭한 비스킷과 달콤한 초콜릿	8801043013001	664116df-2538-413b-97d1-8844f60685b2	빼빼로	롯데제과	개	{}	1200	750	0.10	t	f	0	{"지방": 11, "단백질": 3, "칼로리": 240, "탄수화물": 32}	{글루텐,유제품}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
0cd9b29f-43f3-4005-aef3-b9ebff109b18	오리온 꼬깔콘 초코첵스 77g	바삭한 콘과 달콤한 초콜릿	8801043014001	664116df-2538-413b-97d1-8844f60685b2	꼬깔콘	오리온	개	{}	1500	900	0.10	t	f	0	{"지방": 15, "단백질": 5, "칼로리": 380, "탄수화물": 58}	{유제품}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
3b5af529-99f0-49c0-a853-35b5f1a49af9	크라운 산도 오리지널 80g	바삭하고 고소한 크래커	8801043015001	664116df-2538-413b-97d1-8844f60685b2	산도	크라운제과	개	{}	1400	850	0.10	t	f	0	{"지방": 20, "단백질": 7, "칼로리": 420, "탄수화물": 55}	{글루텐}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
ca089464-ddeb-412b-b9d0-d9e3f7958cfb	해태 허니버터칩 60g	달콤짭짤한 허니버터 맛	8801043016001	664116df-2538-413b-97d1-8844f60685b2	허니버터칩	해태제과	개	{}	1800	1100	0.10	t	f	0	{"지방": 19, "단백질": 4, "칼로리": 320, "탄수화물": 34}	{유제품}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
436e1f3e-6763-4963-a14f-3782045ee6f8	농심 양파링 50g	바삭한 양파 맛 스낵	8801043017001	664116df-2538-413b-97d1-8844f60685b2	농심	농심	개	{}	1500	900	0.10	t	f	0	{"지방": 14, "단백질": 4, "칼로리": 260, "탄수화물": 30}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
9cf6e5ea-9f49-4d36-815d-ede367ef0e86	서울우유 1000ml	신선한 목장 우유	8801043021001	83a38d2c-23dc-42d2-a6a7-7b274b509c3b	서울우유	서울우유협동조합	개	{}	2800	1800	0.08	t	f	0	{"지방": 36, "단백질": 32, "칼로리": 650, "탄수화물": 48}	{유제품}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
77f91e31-6396-44b7-abe5-2b28816d64ed	매일우유 고칼슘 1000ml	칼슘이 풍부한 영양 우유	8801043021002	83a38d2c-23dc-42d2-a6a7-7b274b509c3b	매일우유	매일유업	개	{}	2900	1850	0.08	t	f	0	{"지방": 36, "단백질": 33, "칼로리": 660, "탄수화물": 50}	{유제품}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
2312b318-92da-441e-9da1-9c64fd1b7468	빙그레 바나나맛우유 240ml	달콤한 바나나 맛 우유	8801043021003	83a38d2c-23dc-42d2-a6a7-7b274b509c3b	바나나맛우유	빙그레	개	{}	1500	950	0.08	t	f	0	{"지방": 5, "단백질": 6, "칼로리": 190, "탄수화물": 32}	{유제품}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
ada8a8cf-065d-46a0-943c-1ca0b2fab158	빙그레 딸기맛우유 240ml	상큼한 딸기 맛 우유	8801043021004	83a38d2c-23dc-42d2-a6a7-7b274b509c3b	딸기맛우유	빙그레	개	{}	1500	950	0.08	t	f	0	{"지방": 5, "단백질": 6, "칼로리": 185, "탄수화물": 30}	{유제품}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
6e47dd11-2d34-4b4e-aba7-1138301c2532	남양 GT 요구르트 65ml	유산균이 살아있는 요구르트	8801043021005	83a38d2c-23dc-42d2-a6a7-7b274b509c3b	GT	남양유업	개	{}	400	250	0.08	t	f	0	{"지방": 1, "단백질": 2, "칼로리": 50, "탄수화물": 10}	{유제품}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
e8bc7b95-46b7-44cc-82c8-f01fd18b700f	CU 삼각김밥 참치마요	고소한 참치마요 삼각김밥	8801043031001	970b5bb1-f964-44ec-9ef6-7f61dee14ac7	CU	CU	개	{}	1500	900	0.08	t	f	0	{"지방": 8, "단백질": 8, "칼로리": 280, "탄수화물": 45}	{계란,대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
6d22153b-828d-4f10-b8d6-eab160d54ba4	CU 삼각김밥 스팸	진짜 스팸이 들어간 삼각김밥	8801043031002	970b5bb1-f964-44ec-9ef6-7f61dee14ac7	CU	CU	개	{}	1800	1100	0.08	t	f	0	{"지방": 11, "단백질": 10, "칼로리": 320, "탄수화물": 48}	{대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
09bf9122-fe40-4471-b1c0-92a1b3b8d508	CU 주먹밥 불고기	달짝지근한 불고기 주먹밥	8801043031003	970b5bb1-f964-44ec-9ef6-7f61dee14ac7	CU	CU	개	{}	2000	1200	0.08	t	f	0	{"지방": 10, "단백질": 12, "칼로리": 350, "탄수화물": 55}	{대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
9d3015cc-7314-464b-b2f9-bd475c91bbcd	오뚜기 컵밥 제육덮밥	매콤한 제육이 올라간 덮밥	8801043031004	970b5bb1-f964-44ec-9ef6-7f61dee14ac7	오뚜기	오뚜기	개	{}	3500	2200	0.08	t	t	3	{"지방": 16, "단백질": 15, "칼로리": 480, "탄수화물": 70}	{대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
89ffde7a-ec60-4065-917d-eb7b9446859e	오뚜기 컵밥 김치볶음밥	얼큰한 김치볶음밥	8801043031005	970b5bb1-f964-44ec-9ef6-7f61dee14ac7	오뚜기	오뚜기	개	{}	3000	1900	0.08	t	t	3	{"지방": 14, "단백질": 12, "칼로리": 420, "탄수화물": 65}	{대두}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
20a3bb80-8198-4a53-923a-8f261f29f8fd	샤프란 주방세제 500ml	기름때까지 깔끔하게	8801043041001	209d6e3a-fa7c-470c-b9b6-d6e55efa4e06	샤프란	LG생활건강	개	{}	3000	1900	0.10	t	f	0	{}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
6ec3a9cc-492f-43e4-8bec-7cc515e89b41	크린랩 만능세정제 500ml	99.9% 세균 제거	8801043041002	209d6e3a-fa7c-470c-b9b6-d6e55efa4e06	크린랩	유한킴벌리	개	{}	4000	2500	0.10	t	f	0	{}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
3d311158-f11b-4de3-889b-5b756a9dc44a	깨끗한나라 화장지 30m 12롤	부드럽고 질긴 화장지	8801043042001	ecc273ad-0551-4467-a934-35b516ecd95d	깨끗한나라	깨끗한나라	개	{}	8000	5200	0.08	t	f	0	{}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
fb58de16-0f6d-4b19-9acc-559c1a180752	크리넥스 티슈 180매	부드러운 프리미엄 티슈	8801043042002	ecc273ad-0551-4467-a934-35b516ecd95d	크리넥스	유한킴벌리	개	{}	3500	2300	0.08	t	f	0	{}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
697f0c31-67a9-4b90-85d0-8a8b78549b2b	2080 치약 120g	불소로 충치 예방	8801043043001	c97a00b2-dd0d-40de-a063-a9aa674e69e3	2080	애경산업	개	{}	2500	1600	0.08	t	f	0	{}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
c437b7de-5bd1-4342-ba93-748c14bb2606	닥터베스트 칫솔 중모	잇몸 건강까지 생각한 칫솔	8801043043002	c97a00b2-dd0d-40de-a063-a9aa674e69e3	닥터베스트	LG생활건강	개	{}	2000	1300	0.08	t	f	0	{}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
da68c1f6-4046-4c99-ad66-ce8d9cbbddef	모나미 153 볼펜 검정	부드러운 필기감의 볼펜	8801043051001	527b9a76-00ac-4dd2-9043-37213a1bd805	모나미	모나미	개	{}	500	300	0.10	t	f	0	{}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
a6a2c6eb-f437-4e50-a71d-e36a89aa8524	포스트잇 3x3 노랑 100매	메모의 필수품	8801043051002	527b9a76-00ac-4dd2-9043-37213a1bd805	포스트잇	3M	개	{}	2000	1300	0.10	t	f	0	{}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
94487011-bd96-42df-9e5d-e5e63be39bda	듀라셀 AA 배터리 4개	오래가는 알카라인 배터리	8801043061001	7903184d-e487-4ac3-9d93-9feb61a99b38	듀라셀	듀라셀	개	{}	8000	5200	0.10	t	f	0	{}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
b1893d3a-06e2-4cef-987b-9cd490dec8be	에너자이저 AAA 배터리 4개	고성능 알카라인 배터리	8801043061002	7903184d-e487-4ac3-9d93-9feb61a99b38	에너자이저	에너자이저	개	{}	7000	4500	0.10	t	f	0	{}	{없음}	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00	f	0
\.


--
-- TOC entry 5446 (class 0 OID 18555)
-- Dependencies: 295
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, role, full_name, phone, avatar_url, address, preferences, is_active, created_at, updated_at) FROM stdin;
3a40a11e-6a63-4259-b387-a33948e9d91a	customer	테스트 점주1	\N	\N	\N	{}	t	2025-08-07 08:38:11.327419+00	2025-08-07 08:38:11.327419+00
49761aab-c140-4ec0-8792-ff716f69ff07	customer	테스트 고객2	\N	\N	\N	{}	t	2025-08-07 08:38:31.170494+00	2025-08-07 08:38:31.170494+00
4de5a99f-c920-476e-b742-57a467e0fc62	store_owner	테스트 점주1	\N	\N	\N	{}	t	2025-08-07 08:39:07.347715+00	2025-08-07 08:39:07.347715+00
b03e3bb0-3d16-4c75-a0f1-cffc793b0441	store_owner	테스트 점주2	\N	\N	\N	{}	t	2025-08-07 08:39:32.643532+00	2025-08-07 08:39:32.643532+00
c907860e-e21c-4a99-94a8-15fd5295878d	headquarters	테스트 본사	\N	\N	\N	{}	t	2025-08-07 08:39:49.475554+00	2025-08-07 08:39:49.475554+00
\.


--
-- TOC entry 5459 (class 0 OID 18860)
-- Dependencies: 308
-- Data for Name: shipments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shipments (id, shipment_number, supply_request_id, status, carrier, tracking_number, shipped_at, estimated_delivery, delivered_at, notes, failure_reason, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4671 (class 0 OID 17661)
-- Dependencies: 285
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 5450 (class 0 OID 18634)
-- Dependencies: 299
-- Data for Name: store_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.store_products (id, store_id, product_id, price, stock_quantity, safety_stock, max_stock, is_available, discount_rate, promotion_start_date, promotion_end_date, created_at, updated_at) FROM stdin;
814ac246-ae0f-4323-bbce-187221f8bf67	075459fe-1cd7-4ad1-8613-09db72cc1c8c	f305b043-d3ec-4dc8-ad66-f96d5f638e24	2000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
fa555f70-aade-4fe2-962f-2e50ea74db84	075459fe-1cd7-4ad1-8613-09db72cc1c8c	13ee4600-7120-460e-b79d-fcb2520bfe2b	1200	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
919cfd66-61d5-431f-a8a6-64f69fa3ec1c	075459fe-1cd7-4ad1-8613-09db72cc1c8c	f36cd26e-7f95-4ee5-8ce2-5d65fd0f8543	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
10db82a5-0081-4ce7-8611-f055ffdca4a3	075459fe-1cd7-4ad1-8613-09db72cc1c8c	a1d78d34-fc02-47e5-bd0c-f0f47db05cff	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
90cc97f4-a5a2-4810-8f61-4c76e8832c0a	075459fe-1cd7-4ad1-8613-09db72cc1c8c	b6f89e05-5d07-4024-8179-915f83ea62f1	2000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
87e1e118-26bc-4455-a8e0-89b002dfccc9	075459fe-1cd7-4ad1-8613-09db72cc1c8c	1c30a32b-f1cf-42f5-ac7f-b801c71dfae0	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
3bf43c41-f676-4110-9d44-66d909624c61	075459fe-1cd7-4ad1-8613-09db72cc1c8c	bf1e6aff-e51a-4e4e-be41-000d381f3c18	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
340e93a7-19e9-40d1-a288-09a7962eeecc	075459fe-1cd7-4ad1-8613-09db72cc1c8c	5ef7943b-ac90-4a43-9918-3292507b59dd	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
4da2a005-ada0-477b-85a1-cd9be7a3d574	075459fe-1cd7-4ad1-8613-09db72cc1c8c	c74e36db-08f8-4e3d-bd91-07db540d9d6a	2000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
57075b9a-9336-448a-a34a-94f9515123ce	075459fe-1cd7-4ad1-8613-09db72cc1c8c	0c3c92c2-0271-449b-875e-4ed0c0726dd8	12000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
8c6f18c5-18a2-4f35-b5d3-c05a53af526f	075459fe-1cd7-4ad1-8613-09db72cc1c8c	851c86e3-3bf5-467c-ae6a-acb511468d42	3000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
a1e72d3d-2966-4417-a0d1-05a84a91009a	075459fe-1cd7-4ad1-8613-09db72cc1c8c	c4fb187d-488f-4a0c-9557-c9468363be14	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
f92a9f99-954b-4c77-bf63-4dc4f7dd9d00	075459fe-1cd7-4ad1-8613-09db72cc1c8c	c2933746-49e3-4908-a733-c0b2f47b34fc	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
cf974e78-fd21-4c84-8aa2-1917cc3e489d	075459fe-1cd7-4ad1-8613-09db72cc1c8c	f29786be-a114-48c7-8fd7-acab64ad01db	1900	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
30ee9766-e62c-4b4c-a495-aba6508475a8	075459fe-1cd7-4ad1-8613-09db72cc1c8c	4fad08c2-3e13-49db-a7ab-89a670b72f89	1300	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
b7ccb4c9-96a4-4da0-9d90-d9b2942447c6	075459fe-1cd7-4ad1-8613-09db72cc1c8c	f698e6a3-9e81-438e-8781-0cf7ca4ce4ff	1200	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
d6aec5de-3286-485a-88f3-9a8eb26f7192	075459fe-1cd7-4ad1-8613-09db72cc1c8c	70d05ccd-165b-4365-be25-f48df80e139b	1200	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
e1a12422-d7f1-4a5d-aa6a-e8ce69a6ffc0	075459fe-1cd7-4ad1-8613-09db72cc1c8c	24244a8c-e72c-4539-98e8-8cd0b3b423f4	1200	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
2791a51b-2880-4747-b267-bfe99f4fbb9e	075459fe-1cd7-4ad1-8613-09db72cc1c8c	24af4562-b99e-469a-8d12-c9bf9ec1c5a5	1200	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
adf179c6-179e-4710-81ef-921f3b7b5044	075459fe-1cd7-4ad1-8613-09db72cc1c8c	5f51f58a-4295-44a3-a6b1-bb7c8c9e9b5f	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
6a363d29-04bc-49d0-854d-fb4bee144732	075459fe-1cd7-4ad1-8613-09db72cc1c8c	dccf2fd7-0438-41e5-9eac-68c514e20e0e	1300	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
1cfc6306-cc38-434b-82fa-a27431f4efd7	075459fe-1cd7-4ad1-8613-09db72cc1c8c	ec67ec69-eec0-4ea3-b399-46a7e83824d5	1400	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
b4bc295f-9d56-438d-ab44-3af6afd179e7	075459fe-1cd7-4ad1-8613-09db72cc1c8c	0f3c3891-2eb2-41da-9b51-b7f7c9c0c726	1400	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
c1b73099-c5f4-40a0-8450-af96a73ec3c3	075459fe-1cd7-4ad1-8613-09db72cc1c8c	eecb4e27-0428-432c-bdd3-07239e370a85	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
a86cbc72-3143-4e2b-b78a-e674f00c6282	075459fe-1cd7-4ad1-8613-09db72cc1c8c	6f4328b8-d9dd-4026-8b6f-a5f305bbe69d	3500	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
68de9ad0-2b39-411d-af1d-f93fb44d4af3	075459fe-1cd7-4ad1-8613-09db72cc1c8c	f0bd0b30-092c-4856-83f4-d8648b9fbf8e	1200	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
a6005765-c3c6-40e4-b377-1efb21085185	075459fe-1cd7-4ad1-8613-09db72cc1c8c	0cd9b29f-43f3-4005-aef3-b9ebff109b18	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
9a16bf9e-573e-4607-abb7-ba234405fa64	075459fe-1cd7-4ad1-8613-09db72cc1c8c	3b5af529-99f0-49c0-a853-35b5f1a49af9	1400	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
34f6c042-f9dc-468a-b662-0e6e3c7d3ab5	075459fe-1cd7-4ad1-8613-09db72cc1c8c	ca089464-ddeb-412b-b9d0-d9e3f7958cfb	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
57e49f98-7af2-4d84-968c-5a5447e449a0	075459fe-1cd7-4ad1-8613-09db72cc1c8c	436e1f3e-6763-4963-a14f-3782045ee6f8	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
494ee0dd-9950-4cf4-98eb-dfd1ffbc1486	075459fe-1cd7-4ad1-8613-09db72cc1c8c	9cf6e5ea-9f49-4d36-815d-ede367ef0e86	2800	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
c4db32de-920a-4854-a709-0e60194ac1b3	075459fe-1cd7-4ad1-8613-09db72cc1c8c	77f91e31-6396-44b7-abe5-2b28816d64ed	2900	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
a8e67e6b-4557-45fd-91e8-f7d6478620fc	075459fe-1cd7-4ad1-8613-09db72cc1c8c	2312b318-92da-441e-9da1-9c64fd1b7468	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
d0214e00-e3f0-472d-9c79-b561cd962c50	075459fe-1cd7-4ad1-8613-09db72cc1c8c	ada8a8cf-065d-46a0-943c-1ca0b2fab158	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
a4d67528-fb37-4d1a-93c4-4c6dc114befc	075459fe-1cd7-4ad1-8613-09db72cc1c8c	6e47dd11-2d34-4b4e-aba7-1138301c2532	400	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
8c16a4ae-e019-454c-90a2-0c2f4308ed11	075459fe-1cd7-4ad1-8613-09db72cc1c8c	e8bc7b95-46b7-44cc-82c8-f01fd18b700f	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
def79f7b-ebfc-4890-830d-28d8136b294b	075459fe-1cd7-4ad1-8613-09db72cc1c8c	6d22153b-828d-4f10-b8d6-eab160d54ba4	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
8726112d-b0ee-4e76-94f2-810da6541035	075459fe-1cd7-4ad1-8613-09db72cc1c8c	09bf9122-fe40-4471-b1c0-92a1b3b8d508	2000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
75a55fc1-cec4-4ce0-865f-2c8ebf8e45ba	075459fe-1cd7-4ad1-8613-09db72cc1c8c	9d3015cc-7314-464b-b2f9-bd475c91bbcd	3500	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
22c34e29-bac9-46aa-a2fc-00e6ff8b94d3	075459fe-1cd7-4ad1-8613-09db72cc1c8c	89ffde7a-ec60-4065-917d-eb7b9446859e	3000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
5743d795-1d71-4132-9a6e-b8c44cddc08d	075459fe-1cd7-4ad1-8613-09db72cc1c8c	20a3bb80-8198-4a53-923a-8f261f29f8fd	3000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
9e84314d-b8ec-4d7b-87d3-80ecedaeb283	075459fe-1cd7-4ad1-8613-09db72cc1c8c	6ec3a9cc-492f-43e4-8bec-7cc515e89b41	4000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
67a8f8d9-9258-4157-a01d-33199f0059b0	075459fe-1cd7-4ad1-8613-09db72cc1c8c	3d311158-f11b-4de3-889b-5b756a9dc44a	8000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
e8831e33-1914-4ee9-a573-c95b6c2ebe7e	075459fe-1cd7-4ad1-8613-09db72cc1c8c	fb58de16-0f6d-4b19-9acc-559c1a180752	3500	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
b2778b79-98a4-4ad5-8382-1b9fafb9ba02	075459fe-1cd7-4ad1-8613-09db72cc1c8c	697f0c31-67a9-4b90-85d0-8a8b78549b2b	2500	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
65bbad80-e703-4c09-a80b-41f2b24f4922	075459fe-1cd7-4ad1-8613-09db72cc1c8c	c437b7de-5bd1-4342-ba93-748c14bb2606	2000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
04f3df52-524e-4564-b544-0dc6476281e6	075459fe-1cd7-4ad1-8613-09db72cc1c8c	da68c1f6-4046-4c99-ad66-ce8d9cbbddef	500	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
3c1b8607-c353-4d17-9055-490557d8db0b	075459fe-1cd7-4ad1-8613-09db72cc1c8c	a6a2c6eb-f437-4e50-a71d-e36a89aa8524	2000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
c0f6db42-4acf-461b-95be-354004a5914e	075459fe-1cd7-4ad1-8613-09db72cc1c8c	94487011-bd96-42df-9e5d-e5e63be39bda	8000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
910a7d96-707d-4112-b937-8bf336ab7802	075459fe-1cd7-4ad1-8613-09db72cc1c8c	b1893d3a-06e2-4cef-987b-9cd490dec8be	7000	0	10	100	t	0	\N	\N	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
83d7a2e4-b7b0-42a2-8f20-1605a7dc3f60	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	f305b043-d3ec-4dc8-ad66-f96d5f638e24	2000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
13378201-b423-4369-83a6-aaafcba308a9	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	13ee4600-7120-460e-b79d-fcb2520bfe2b	1200	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
4353789a-fb4b-4858-8984-53233b27bcc7	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	f36cd26e-7f95-4ee5-8ce2-5d65fd0f8543	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
8c1cc83d-ab02-45e0-8aa7-8d82e09a9073	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	a1d78d34-fc02-47e5-bd0c-f0f47db05cff	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
cda00ec0-c234-4f19-913d-2ef75fd6c818	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	b6f89e05-5d07-4024-8179-915f83ea62f1	2000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
ce023a26-5523-4612-bea0-a02a111f121d	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	1c30a32b-f1cf-42f5-ac7f-b801c71dfae0	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
b9da2c5c-d752-4f86-bba2-f268bab60b78	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	bf1e6aff-e51a-4e4e-be41-000d381f3c18	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
43b027a3-63aa-46d3-bc1a-a9308ee20b46	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	5ef7943b-ac90-4a43-9918-3292507b59dd	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
237634ef-88e7-42cf-aaac-200b3f0d3a3e	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	c74e36db-08f8-4e3d-bd91-07db540d9d6a	2000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
7a18b776-c85f-45cd-a442-497e2c2558f1	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	0c3c92c2-0271-449b-875e-4ed0c0726dd8	12000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
14ff080a-7153-48ca-92d4-f4ba14cc1ec8	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	851c86e3-3bf5-467c-ae6a-acb511468d42	3000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
18f81341-6b5b-4659-b6cd-acb0b009dc51	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	c4fb187d-488f-4a0c-9557-c9468363be14	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
77c738fc-6632-485e-938d-6d4e4ea20949	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	c2933746-49e3-4908-a733-c0b2f47b34fc	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
56e184a8-af39-404f-89ca-3005a96e8dad	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	f29786be-a114-48c7-8fd7-acab64ad01db	1900	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
2f6a08cc-ba30-4c4f-9f8b-36745bf2defb	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	4fad08c2-3e13-49db-a7ab-89a670b72f89	1300	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
4285539e-6178-4dc7-9ccf-a3eaf934bef5	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	f698e6a3-9e81-438e-8781-0cf7ca4ce4ff	1200	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
22d617cf-da0d-4ada-9c1a-12adc08dcb50	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	70d05ccd-165b-4365-be25-f48df80e139b	1200	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
87a142fd-b0ba-49fd-b973-ccea09a8e020	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	24244a8c-e72c-4539-98e8-8cd0b3b423f4	1200	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
643b31d7-f3e5-4b85-b97d-0dfe202b8b61	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	24af4562-b99e-469a-8d12-c9bf9ec1c5a5	1200	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
594bf597-b7e9-419b-a034-e8da5a32fb96	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	5f51f58a-4295-44a3-a6b1-bb7c8c9e9b5f	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
ffdd5994-0b83-442f-a7e2-2c88134b3a23	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	dccf2fd7-0438-41e5-9eac-68c514e20e0e	1300	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
cba87471-15b3-43da-8bfc-b869b2e26cd9	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	ec67ec69-eec0-4ea3-b399-46a7e83824d5	1400	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
e7bd6ca7-130b-4cd4-b39d-b31f64272d8b	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	0f3c3891-2eb2-41da-9b51-b7f7c9c0c726	1400	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
5169eca9-ae33-40f2-a75a-02540046d716	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	eecb4e27-0428-432c-bdd3-07239e370a85	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
a226bdf8-afba-48e5-a73a-e68919948920	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	6f4328b8-d9dd-4026-8b6f-a5f305bbe69d	3500	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
970a43b6-2a1c-4148-8ff0-5b8540f44b70	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	f0bd0b30-092c-4856-83f4-d8648b9fbf8e	1200	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
322115d2-b739-4ec1-91b0-e2ee82200b0b	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	0cd9b29f-43f3-4005-aef3-b9ebff109b18	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
a401ea67-d1dc-44cc-9f3e-46cf42c08025	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	3b5af529-99f0-49c0-a853-35b5f1a49af9	1400	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
da901df3-2b57-4979-9ff6-ce2adae8b2a4	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	ca089464-ddeb-412b-b9d0-d9e3f7958cfb	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
711a3848-1b2e-4975-b461-bdacc6afb120	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	436e1f3e-6763-4963-a14f-3782045ee6f8	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
d0439498-9c41-47ea-9f7a-ac44f67168cb	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	9cf6e5ea-9f49-4d36-815d-ede367ef0e86	2800	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
364eb58a-d2f5-4db3-8f6d-12f0b0832cbc	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	77f91e31-6396-44b7-abe5-2b28816d64ed	2900	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
1428b18b-9d64-493f-a042-cdaf373160a8	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	2312b318-92da-441e-9da1-9c64fd1b7468	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
06fce7fb-fe77-4483-bc61-0c7653e0ff42	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	ada8a8cf-065d-46a0-943c-1ca0b2fab158	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
f1130e03-3ee3-495d-a7de-d33f2a4475d1	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	6e47dd11-2d34-4b4e-aba7-1138301c2532	400	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
b8537e77-25dd-4925-8570-4477272d7db2	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	e8bc7b95-46b7-44cc-82c8-f01fd18b700f	1500	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
d0f01611-fd4a-4012-bd92-b62621a1cd04	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	6d22153b-828d-4f10-b8d6-eab160d54ba4	1800	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
98718148-7115-41c1-aa40-f7e46e2c26f2	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	09bf9122-fe40-4471-b1c0-92a1b3b8d508	2000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
c7aa9b90-6373-4ac9-be83-3d0aab9eadb4	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	9d3015cc-7314-464b-b2f9-bd475c91bbcd	3500	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
593ff2cb-cc83-48d5-a2ba-0a426601ae64	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	89ffde7a-ec60-4065-917d-eb7b9446859e	3000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
558b5f8d-3c7f-4038-89b2-a7a45d428a8d	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	20a3bb80-8198-4a53-923a-8f261f29f8fd	3000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
8572cc27-cb33-4065-9aed-d15348c6be93	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	6ec3a9cc-492f-43e4-8bec-7cc515e89b41	4000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
5e1c6888-67f9-444c-903a-068de41a4c13	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	3d311158-f11b-4de3-889b-5b756a9dc44a	8000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
52b3ec5f-9477-4d15-b318-9eaa3367dff1	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	fb58de16-0f6d-4b19-9acc-559c1a180752	3500	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
a0b76869-9ea2-44c5-8fd1-cc3b033db242	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	697f0c31-67a9-4b90-85d0-8a8b78549b2b	2500	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
afbf2113-e96e-4597-b121-9a1fbb6f2a01	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	c437b7de-5bd1-4342-ba93-748c14bb2606	2000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
346860c9-24ab-4c3f-a095-3272143069df	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	da68c1f6-4046-4c99-ad66-ce8d9cbbddef	500	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
bb4b834e-122d-4822-bc3d-b0bf6d9650cb	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	a6a2c6eb-f437-4e50-a71d-e36a89aa8524	2000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
55c2f3ca-7f42-407f-b7ca-d1932a54e513	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	94487011-bd96-42df-9e5d-e5e63be39bda	8000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
3991bfbc-c4ec-494c-b127-34bdf8da02d4	c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	b1893d3a-06e2-4cef-987b-9cd490dec8be	7000	0	10	100	t	0	\N	\N	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
\.


--
-- TOC entry 5449 (class 0 OID 18612)
-- Dependencies: 298
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stores (id, name, owner_id, address, phone, business_hours, location, delivery_available, pickup_available, delivery_radius, min_order_amount, delivery_fee, is_active, created_at, updated_at) FROM stdin;
075459fe-1cd7-4ad1-8613-09db72cc1c8c	테스트 편의점1	4de5a99f-c920-476e-b742-57a467e0fc62	서울시 강남구 테스트로 123	02-1111-1111	{"fri": {"open": "07:00", "close": "23:00"}, "mon": {"open": "07:00", "close": "23:00"}, "sat": {"open": "07:00", "close": "23:00"}, "sun": {"open": "07:00", "close": "23:00"}, "thu": {"open": "07:00", "close": "23:00"}, "tue": {"open": "07:00", "close": "23:00"}, "wed": {"open": "07:00", "close": "23:00"}}	0101000020E61000000000000000C05F400000000000C04240	t	t	3000	0	0	t	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	테스트 편의점2	b03e3bb0-3d16-4c75-a0f1-cffc793b0441	솔샘로 174	02-2222-2222	{"fri": {"open": "07:00", "close": "23:00"}, "mon": {"open": "07:00", "close": "23:00"}, "sat": {"open": "07:00", "close": "23:00"}, "sun": {"open": "07:00", "close": "23:00"}, "thu": {"open": "07:00", "close": "23:00"}, "tue": {"open": "07:00", "close": "23:00"}, "wed": {"open": "07:00", "close": "23:00"}}	0101000020E61000000000000000C05F400000000000C04240	t	t	3000	0	0	t	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
\.


--
-- TOC entry 5458 (class 0 OID 18835)
-- Dependencies: 307
-- Data for Name: supply_request_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supply_request_items (id, supply_request_id, product_id, product_name, requested_quantity, approved_quantity, unit_cost, total_cost, reason, current_stock, created_at) FROM stdin;
\.


--
-- TOC entry 5457 (class 0 OID 18802)
-- Dependencies: 306
-- Data for Name: supply_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supply_requests (id, request_number, store_id, requested_by, status, priority, total_amount, approved_amount, expected_delivery_date, actual_delivery_date, approved_by, approved_at, notes, rejection_reason, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5461 (class 0 OID 18897)
-- Dependencies: 310
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (id, key, value, description, category, is_public, created_at, updated_at) FROM stdin;
0fac827c-ff26-4b49-8476-44f7ddca29c0	app_name	"편의점 관리 시스템"	애플리케이션 이름	general	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
de7ae876-7885-4141-8528-e1e1faaa9536	app_version	"2.0.0"	애플리케이션 버전	general	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
53164d50-6350-4987-a8bf-660a012189f3	default_tax_rate	0.1	기본 부가세율	business	f	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
17f64ec1-3773-42a1-87c3-a6e1eb2af7ac	min_order_amount	1000	최소 주문 금액	business	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
842ae4c4-73e9-44e8-ac64-265308db1cc0	delivery_fee	2000	기본 배송비	business	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
18263b3a-2e64-422f-8d49-4bfe2a04cf8c	auto_add_products_to_store	true	새 지점 생성 시 모든 상품 자동 추가 여부	store	f	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
68940924-047d-43ef-af12-17f15993f903	default_store_stock_quantity	50	새 지점 생성 시 기본 재고 수량	store	f	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
35139b73-3123-44b3-9eda-ad10cf67d160	hq_can_manage_all_products	true	본사에서 모든 상품 관리 가능 여부	hq	f	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
2fcc0297-48cd-4f53-8502-a124ac428932	support_email	"support@convistore.com"	고객지원 이메일	general	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
ca7ca9e9-53b0-413d-a3b1-39a7a9f324aa	support_phone	"1588-1234"	고객지원 전화번호	general	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
a3e2facd-26b7-4927-8754-e34219d6a021	pickup_preparation_time	15	픽업 준비 시간(분)	order	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
5a2a0855-1483-421e-929d-3de9accfe7d8	store_approval_required	true	점포 승인 필요 여부	store	f	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
65f747ef-d4c5-4910-97dc-df0f02ce8b88	max_products_per_store	1000	점포당 최대 상품 수	store	f	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
504abcbd-bdaa-4dc9-8274-82b52cfd5713	notification_enabled	true	알림 기능 활성화	notification	t	2025-08-07 08:37:05.19971+00	2025-08-07 08:37:05.19971+00
\.


--
-- TOC entry 5469 (class 0 OID 19286)
-- Dependencies: 323
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.wishlists (id, created_at, user_id, product_id) FROM stdin;
042b3e11-298d-48f6-893a-d82fa755fc9c	2025-08-08 01:37:25.502202+00	b03e3bb0-3d16-4c75-a0f1-cffc793b0441	f305b043-d3ec-4dc8-ad66-f96d5f638e24
\.


--
-- TOC entry 5462 (class 0 OID 19091)
-- Dependencies: 316
-- Data for Name: messages_2025_08_06; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_08_06 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 5463 (class 0 OID 19102)
-- Dependencies: 317
-- Data for Name: messages_2025_08_07; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_08_07 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 5464 (class 0 OID 19113)
-- Dependencies: 318
-- Data for Name: messages_2025_08_08; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_08_08 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 5465 (class 0 OID 19124)
-- Dependencies: 319
-- Data for Name: messages_2025_08_09; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_08_09 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 5466 (class 0 OID 19135)
-- Dependencies: 320
-- Data for Name: messages_2025_08_10; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_08_10 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- TOC entry 5439 (class 0 OID 17000)
-- Dependencies: 273
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-08-07 07:41:25
20211116045059	2025-08-07 07:41:26
20211116050929	2025-08-07 07:41:26
20211116051442	2025-08-07 07:41:27
20211116212300	2025-08-07 07:41:28
20211116213355	2025-08-07 07:41:29
20211116213934	2025-08-07 07:41:30
20211116214523	2025-08-07 07:41:31
20211122062447	2025-08-07 07:41:31
20211124070109	2025-08-07 07:41:32
20211202204204	2025-08-07 07:41:33
20211202204605	2025-08-07 07:41:34
20211210212804	2025-08-07 07:41:36
20211228014915	2025-08-07 07:41:37
20220107221237	2025-08-07 07:41:38
20220228202821	2025-08-07 07:41:38
20220312004840	2025-08-07 07:41:39
20220603231003	2025-08-07 07:41:40
20220603232444	2025-08-07 07:41:41
20220615214548	2025-08-07 07:41:42
20220712093339	2025-08-07 07:41:42
20220908172859	2025-08-07 07:41:43
20220916233421	2025-08-07 07:41:44
20230119133233	2025-08-07 07:41:44
20230128025114	2025-08-07 07:41:45
20230128025212	2025-08-07 07:41:46
20230227211149	2025-08-07 07:41:47
20230228184745	2025-08-07 07:41:48
20230308225145	2025-08-07 07:41:48
20230328144023	2025-08-07 07:41:49
20231018144023	2025-08-07 07:41:50
20231204144023	2025-08-07 07:41:51
20231204144024	2025-08-07 07:41:52
20231204144025	2025-08-07 07:41:53
20240108234812	2025-08-07 07:41:53
20240109165339	2025-08-07 07:41:54
20240227174441	2025-08-07 07:41:55
20240311171622	2025-08-07 07:41:56
20240321100241	2025-08-07 07:41:58
20240401105812	2025-08-07 07:42:00
20240418121054	2025-08-07 07:42:01
20240523004032	2025-08-07 07:42:03
20240618124746	2025-08-07 07:42:04
20240801235015	2025-08-07 07:42:05
20240805133720	2025-08-07 07:42:05
20240827160934	2025-08-07 07:42:06
20240919163303	2025-08-07 07:42:07
20240919163305	2025-08-07 07:42:08
20241019105805	2025-08-07 07:42:08
20241030150047	2025-08-07 07:42:11
20241108114728	2025-08-07 07:42:12
20241121104152	2025-08-07 07:42:13
20241130184212	2025-08-07 07:42:14
20241220035512	2025-08-07 07:42:14
20241220123912	2025-08-07 07:42:15
20241224161212	2025-08-07 07:42:16
20250107150512	2025-08-07 07:42:17
20250110162412	2025-08-07 07:42:17
20250123174212	2025-08-07 07:42:18
20250128220012	2025-08-07 07:42:19
20250506224012	2025-08-07 07:42:19
20250523164012	2025-08-07 07:42:20
20250714121412	2025-08-07 07:42:21
\.


--
-- TOC entry 5441 (class 0 OID 17032)
-- Dependencies: 276
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- TOC entry 5425 (class 0 OID 16544)
-- Dependencies: 256
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- TOC entry 5445 (class 0 OID 17314)
-- Dependencies: 283
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5427 (class 0 OID 16586)
-- Dependencies: 258
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-08-07 07:41:24.148326
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-08-07 07:41:24.216891
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-08-07 07:41:24.235597
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-08-07 07:41:24.480319
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-08-07 07:41:25.016091
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-08-07 07:41:25.021928
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-08-07 07:41:25.028043
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-08-07 07:41:25.041701
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-08-07 07:41:25.047171
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-08-07 07:41:25.052665
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-08-07 07:41:25.059712
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-08-07 07:41:25.065844
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-08-07 07:41:25.108236
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-08-07 07:41:25.116524
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-08-07 07:41:25.124845
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-08-07 07:41:25.168683
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-08-07 07:41:25.18004
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-08-07 07:41:25.190634
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-08-07 07:41:25.201174
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-08-07 07:41:25.214609
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-08-07 07:41:25.220415
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-08-07 07:41:25.228394
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-08-07 07:41:25.254378
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-08-07 07:41:25.275771
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-08-07 07:41:25.281806
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-08-07 07:41:25.289536
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-08-07 08:34:41.846934
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-08-07 08:34:41.949204
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-08-07 08:34:41.966218
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-08-07 08:34:41.976239
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-08-07 08:34:41.983479
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-08-07 08:34:41.993049
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-08-07 08:34:42.002323
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-08-07 08:34:42.012196
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-08-07 08:34:42.015319
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-08-07 08:34:42.031063
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-08-07 08:34:42.041214
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-08-07 08:34:42.060224
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-08-07 08:34:42.103884
\.


--
-- TOC entry 5426 (class 0 OID 16559)
-- Dependencies: 257
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- TOC entry 5444 (class 0 OID 17269)
-- Dependencies: 282
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5442 (class 0 OID 17067)
-- Dependencies: 277
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- TOC entry 5443 (class 0 OID 17081)
-- Dependencies: 278
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- TOC entry 5467 (class 0 OID 19172)
-- Dependencies: 321
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.schema_migrations (version, statements, name, created_by, idempotency_key) FROM stdin;
20250808011204	{"SET statement_timeout = 0","SET lock_timeout = 0","SET idle_in_transaction_session_timeout = 0","SET client_encoding = 'UTF8'","SET standard_conforming_strings = on","SELECT pg_catalog.set_config('search_path', '', false)","SET check_function_bodies = false","SET xmloption = content","SET client_min_messages = warning","SET row_security = off","COMMENT ON SCHEMA \\"public\\" IS 'standard public schema'","CREATE EXTENSION IF NOT EXISTS \\"pg_graphql\\" WITH SCHEMA \\"graphql\\"","CREATE EXTENSION IF NOT EXISTS \\"pg_stat_statements\\" WITH SCHEMA \\"extensions\\"","CREATE EXTENSION IF NOT EXISTS \\"pgcrypto\\" WITH SCHEMA \\"extensions\\"","CREATE EXTENSION IF NOT EXISTS \\"postgis\\" WITH SCHEMA \\"public\\"","CREATE EXTENSION IF NOT EXISTS \\"postgis_topology\\" WITH SCHEMA \\"topology\\"","CREATE EXTENSION IF NOT EXISTS \\"supabase_vault\\" WITH SCHEMA \\"vault\\"","CREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\" WITH SCHEMA \\"extensions\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"check_low_stock\\"() RETURNS \\"trigger\\"\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nBEGIN\n    -- 재고가 안전재고 이하로 떨어졌을 때 알림 생성\n    IF NEW.stock_quantity <= NEW.safety_stock AND OLD.stock_quantity > OLD.safety_stock THEN\n        INSERT INTO notifications (\n            user_id,\n            type,\n            title,\n            message,\n            data,\n            priority\n        ) VALUES (\n            (SELECT owner_id FROM stores WHERE id = NEW.store_id),\n            'low_stock',\n            '재고 부족 알림',\n            '상품 \\"' || (SELECT name FROM products WHERE id = NEW.product_id) || '\\"의 재고가 부족합니다.',\n            jsonb_build_object(\n                'store_id', NEW.store_id,\n                'product_id', NEW.product_id,\n                'current_stock', NEW.stock_quantity,\n                'safety_stock', NEW.safety_stock\n            ),\n            'high'\n        );\n    END IF;\n    \n    RETURN NEW;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"check_low_stock\\"() OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"generate_order_number\\"() RETURNS \\"trigger\\"\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nDECLARE\n    new_number TEXT;\n    date_part TEXT;\n    counter INTEGER := 1;\nBEGIN\n    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN\n        date_part := TO_CHAR(NOW(), 'YYYYMMDD');\n        \n        -- 중복 방지를 위한 루프\n        LOOP\n            new_number := 'ORD-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');\n            \n            -- 해당 번호가 이미 존재하는지 확인\n            IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = new_number) THEN\n                NEW.order_number := new_number;\n                EXIT;\n            END IF;\n            \n            counter := counter + 1;\n            \n            -- 무한 루프 방지\n            IF counter > 9999 THEN\n                RAISE EXCEPTION '주문 번호 생성 실패: 최대 시도 횟수 초과';\n            END IF;\n        END LOOP;\n    END IF;\n    \n    RETURN NEW;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"generate_order_number\\"() OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"generate_shipment_number\\"() RETURNS \\"trigger\\"\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nDECLARE\n    new_number TEXT;\n    date_part TEXT;\n    counter INTEGER := 1;\nBEGIN\n    IF NEW.shipment_number IS NULL OR NEW.shipment_number = '' THEN\n        date_part := TO_CHAR(NOW(), 'YYYYMMDD');\n        \n        -- 중복 방지를 위한 루프\n        LOOP\n            new_number := 'SHIP-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');\n            \n            -- 해당 번호가 이미 존재하는지 확인\n            IF NOT EXISTS (SELECT 1 FROM shipments WHERE shipment_number = new_number) THEN\n                NEW.shipment_number := new_number;\n                EXIT;\n            END IF;\n            \n            counter := counter + 1;\n            \n            -- 무한 루프 방지\n            IF counter > 9999 THEN\n                RAISE EXCEPTION '배송 번호 생성 실패: 최대 시도 횟수 초과';\n            END IF;\n        END LOOP;\n    END IF;\n    \n    RETURN NEW;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"generate_shipment_number\\"() OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"generate_supply_request_number\\"() RETURNS \\"trigger\\"\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nDECLARE\n    new_number TEXT;\n    date_part TEXT;\n    counter INTEGER := 1;\nBEGIN\n    IF NEW.request_number IS NULL OR NEW.request_number = '' THEN\n        date_part := TO_CHAR(NOW(), 'YYYYMMDD');\n        \n        -- 중복 방지를 위한 루프\n        LOOP\n            new_number := 'SUP-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');\n            \n            -- 해당 번호가 이미 존재하는지 확인\n            IF NOT EXISTS (SELECT 1 FROM supply_requests WHERE request_number = new_number) THEN\n                NEW.request_number := new_number;\n                EXIT;\n            END IF;\n            \n            counter := counter + 1;\n            \n            -- 무한 루프 방지\n            IF counter > 9999 THEN\n                RAISE EXCEPTION '물류 요청 번호 생성 실패: 최대 시도 횟수 초과';\n            END IF;\n        END LOOP;\n    END IF;\n    \n    RETURN NEW;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"generate_supply_request_number\\"() OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"get_product_rankings\\"(\\"start_date\\" \\"date\\" DEFAULT (CURRENT_DATE - '30 days'::interval), \\"end_date\\" \\"date\\" DEFAULT CURRENT_DATE) RETURNS TABLE(\\"product_id\\" \\"uuid\\", \\"product_name\\" \\"text\\", \\"category_name\\" \\"text\\", \\"total_sold\\" bigint, \\"total_revenue\\" numeric, \\"avg_price\\" numeric, \\"rank_position\\" bigint)\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nBEGIN\n    RETURN QUERY\n    SELECT \n        p.id as product_id,\n        p.name as product_name,\n        c.name as category_name,\n        COUNT(oi.id)::BIGINT as total_sold,\n        COALESCE(SUM(oi.subtotal), 0) as total_revenue,\n        COALESCE(AVG(oi.unit_price), 0) as avg_price,\n        RANK() OVER (ORDER BY COALESCE(SUM(oi.subtotal), 0) DESC) as rank_position\n    FROM products p\n    LEFT JOIN categories c ON p.category_id = c.id\n    LEFT JOIN order_items oi ON p.id = oi.product_id\n    LEFT JOIN orders o ON oi.order_id = o.id \n        AND o.status = 'completed'\n        AND DATE(o.created_at) BETWEEN start_date AND end_date\n    GROUP BY p.id, p.name, c.name\n    ORDER BY total_revenue DESC;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"get_product_rankings\\"(\\"start_date\\" \\"date\\", \\"end_date\\" \\"date\\") OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"get_sales_summary\\"(\\"start_date\\" \\"date\\" DEFAULT (CURRENT_DATE - '30 days'::interval), \\"end_date\\" \\"date\\" DEFAULT CURRENT_DATE) RETURNS TABLE(\\"total_orders\\" bigint, \\"completed_orders\\" bigint, \\"cancelled_orders\\" bigint, \\"total_revenue\\" numeric, \\"avg_order_value\\" numeric, \\"pickup_orders\\" bigint, \\"delivery_orders\\" bigint)\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nBEGIN\n    RETURN QUERY\n    SELECT \n        COUNT(*)::BIGINT as total_orders,\n        COUNT(CASE WHEN o.status = 'completed' THEN 1 END)::BIGINT as completed_orders,\n        COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END)::BIGINT as cancelled_orders,\n        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_revenue,\n        COALESCE(AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END), 0) as avg_order_value,\n        COUNT(CASE WHEN o.type = 'pickup' THEN 1 END)::BIGINT as pickup_orders,\n        COUNT(CASE WHEN o.type = 'delivery' THEN 1 END)::BIGINT as delivery_orders\n    FROM orders o\n    WHERE DATE(o.created_at) BETWEEN start_date AND end_date;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"get_sales_summary\\"(\\"start_date\\" \\"date\\", \\"end_date\\" \\"date\\") OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"get_store_rankings\\"(\\"start_date\\" \\"date\\" DEFAULT (CURRENT_DATE - '30 days'::interval), \\"end_date\\" \\"date\\" DEFAULT CURRENT_DATE) RETURNS TABLE(\\"store_id\\" \\"uuid\\", \\"store_name\\" \\"text\\", \\"total_revenue\\" numeric, \\"total_orders\\" bigint, \\"avg_order_value\\" numeric, \\"rank_position\\" bigint)\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nBEGIN\n    RETURN QUERY\n    SELECT \n        s.id as store_id,\n        s.name as store_name,\n        COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) as total_revenue,\n        COUNT(o.id)::BIGINT as total_orders,\n        COALESCE(AVG(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE NULL END), 0) as avg_order_value,\n        RANK() OVER (ORDER BY COALESCE(SUM(CASE WHEN o.status = 'completed' THEN o.total_amount ELSE 0 END), 0) DESC) as rank_position\n    FROM stores s\n    LEFT JOIN orders o ON s.id = o.store_id \n        AND DATE(o.created_at) BETWEEN start_date AND end_date\n    GROUP BY s.id, s.name\n    ORDER BY total_revenue DESC;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"get_store_rankings\\"(\\"start_date\\" \\"date\\", \\"end_date\\" \\"date\\") OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"handle_order_completion\\"() RETURNS \\"trigger\\"\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nDECLARE\n    order_item RECORD;\n    store_name TEXT;\nBEGIN\n    -- 주문이 완료 상태로 변경될 때만 실행\n    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN\n        -- 지점명 조회\n        SELECT name INTO store_name FROM stores WHERE id = NEW.store_id;\n        \n        -- 고객에게 주문 완료 알림 생성\n        INSERT INTO notifications (\n            user_id,\n            type,\n            title,\n            message,\n            data,\n            priority\n        ) VALUES (\n            NEW.customer_id,\n            'order_completed',\n            '주문이 완료되었습니다',\n            '주문번호 ' || NEW.order_number || '의 준비가 완료되었습니다. ' || COALESCE(store_name, '지점') || '에서 픽업 가능합니다.',\n            jsonb_build_object(\n                'order_id', NEW.id,\n                'order_number', NEW.order_number,\n                'store_id', NEW.store_id,\n                'store_name', COALESCE(store_name, '지점')\n            ),\n            'high'\n        );\n        \n        -- 주문 아이템들을 순회하며 재고 차감\n        FOR order_item IN \n            SELECT oi.product_id, oi.quantity, sp.id as store_product_id\n            FROM order_items oi\n            LEFT JOIN store_products sp ON sp.store_id = NEW.store_id AND sp.product_id = oi.product_id\n            WHERE oi.order_id = NEW.id\n        LOOP\n            -- 재고가 있는 경우에만 차감\n            IF order_item.store_product_id IS NOT NULL THEN\n                -- 재고 차감\n                UPDATE store_products \n                SET stock_quantity = GREATEST(0, stock_quantity - order_item.quantity),\n                    updated_at = NOW()\n                WHERE id = order_item.store_product_id;\n                \n                -- 재고 이력 기록\n                INSERT INTO inventory_transactions (\n                    store_product_id,\n                    transaction_type,\n                    quantity,\n                    previous_quantity,\n                    new_quantity,\n                    reference_type,\n                    reference_id,\n                    reason,\n                    created_by\n                ) VALUES (\n                    order_item.store_product_id,\n                    'out',\n                    order_item.quantity,\n                    (SELECT stock_quantity + order_item.quantity FROM store_products WHERE id = order_item.store_product_id),\n                    (SELECT stock_quantity FROM store_products WHERE id = order_item.store_product_id),\n                    'order',\n                    NEW.id,\n                    '주문 완료로 인한 재고 차감',\n                    NEW.customer_id\n                );\n            END IF;\n        END LOOP;\n    END IF;\n    \n    RETURN NEW;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"handle_order_completion\\"() OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"handle_shipment_delivery\\"() RETURNS \\"trigger\\"\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nDECLARE\n    request_item RECORD;\n    store_product_id UUID;\nBEGIN\n    -- 배송이 완료 상태로 변경될 때만 실행\n    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN\n        -- 물류 요청 아이템들을 순회하며 재고 증가\n        FOR request_item IN \n            SELECT sri.product_id, sri.approved_quantity, sr.store_id\n            FROM supply_request_items sri\n            JOIN supply_requests sr ON sr.id = sri.supply_request_id\n            WHERE sr.id = NEW.supply_request_id AND sri.approved_quantity > 0\n        LOOP\n            -- store_products에서 해당 상품의 ID 조회\n            SELECT id INTO store_product_id \n            FROM store_products \n            WHERE store_id = request_item.store_id AND product_id = request_item.product_id;\n            \n            IF store_product_id IS NOT NULL THEN\n                -- 재고 증가\n                UPDATE store_products \n                SET stock_quantity = stock_quantity + request_item.approved_quantity,\n                    updated_at = NOW()\n                WHERE id = store_product_id;\n                \n                -- 재고 이력 기록\n                INSERT INTO inventory_transactions (\n                    store_product_id,\n                    transaction_type,\n                    quantity,\n                    previous_quantity,\n                    new_quantity,\n                    reference_type,\n                    reference_id,\n                    reason,\n                    created_by\n                ) VALUES (\n                    store_product_id,\n                    'in',\n                    request_item.approved_quantity,\n                    (SELECT stock_quantity - request_item.approved_quantity FROM store_products WHERE id = store_product_id),\n                    (SELECT stock_quantity FROM store_products WHERE id = store_product_id),\n                    'supply_request',\n                    NEW.supply_request_id,\n                    '물류 배송 완료로 인한 재고 증가',\n                    NEW.id\n                );\n            END IF;\n        END LOOP;\n        \n        -- 물류 요청 상태를 delivered로 업데이트\n        UPDATE supply_requests \n        SET status = 'delivered',\n            actual_delivery_date = CURRENT_DATE,\n            updated_at = NOW()\n        WHERE id = NEW.supply_request_id;\n    END IF;\n    \n    RETURN NEW;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"handle_shipment_delivery\\"() OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"initialize_store_products\\"() RETURNS \\"trigger\\"\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nBEGIN\n    -- 새로 생성된 지점에 대해 모든 활성 상품에 대한 초기 재고 레코드 생성\n    INSERT INTO store_products (store_id, product_id, price, stock_quantity, is_available)\n    SELECT \n        NEW.id as store_id,\n        p.id as product_id,\n        p.base_price as price,\n        0 as stock_quantity,  -- 초기 재고는 0개\n        true as is_available\n    FROM products p\n    WHERE p.is_active = true\n    AND NOT EXISTS (\n        SELECT 1 FROM store_products sp \n        WHERE sp.store_id = NEW.id AND sp.product_id = p.id\n    );\n    \n    RETURN NEW;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"initialize_store_products\\"() OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"log_order_status_change\\"() RETURNS \\"trigger\\"\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nBEGIN\n    IF OLD.status IS DISTINCT FROM NEW.status THEN\n        INSERT INTO order_status_history (order_id, status, changed_by, notes)\n        VALUES (NEW.id, NEW.status, auth.uid(), 'Status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status);\n    END IF;\n    RETURN NEW;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"log_order_status_change\\"() OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"prevent_duplicate_orders\\"() RETURNS \\"trigger\\"\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nDECLARE\n    existing_order_id UUID;\n    payment_key TEXT;\nBEGIN\n    -- payment_data에서 paymentKey 추출\n    payment_key := NEW.payment_data->>'paymentKey';\n    \n    -- paymentKey가 있는 경우에만 중복 검사\n    IF payment_key IS NOT NULL AND payment_key != '' THEN\n        -- 같은 paymentKey를 가진 주문이 이미 있는지 확인\n        SELECT id INTO existing_order_id\n        FROM orders \n        WHERE payment_data->>'paymentKey' = payment_key\n        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)\n        LIMIT 1;\n        \n        -- 중복 주문이 발견되면 에러 발생\n        IF existing_order_id IS NOT NULL THEN\n            RAISE EXCEPTION '중복 주문이 감지되었습니다. PaymentKey: %', payment_key;\n        END IF;\n    END IF;\n    \n    RETURN NEW;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"prevent_duplicate_orders\\"() OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"update_inventory_on_supply_delivery\\"() RETURNS \\"trigger\\"\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nDECLARE\n    supply_item RECORD;\nBEGIN\n    -- 물류 요청이 배송 완료 상태로 변경되었을 때만 실행\n    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN\n        -- 물류 요청 상품들의 재고를 증가\n        FOR supply_item IN \n            SELECT sri.product_id, sri.approved_quantity, sr.store_id\n            FROM public.supply_request_items sri\n            JOIN public.supply_requests sr ON sri.supply_request_id = sr.id\n            WHERE sri.supply_request_id = NEW.id\n                AND sri.approved_quantity > 0\n        LOOP\n            -- store_products 테이블의 재고 증가 (RLS 우회)\n            UPDATE public.store_products \n            SET stock_quantity = stock_quantity + supply_item.approved_quantity,\n                updated_at = NOW()\n            WHERE store_id = supply_item.store_id \n                AND product_id = supply_item.product_id;\n            \n            -- 재고 거래 이력 기록 (RLS 우회)\n            INSERT INTO public.inventory_transactions (\n                store_product_id,\n                transaction_type,\n                quantity,\n                previous_quantity,\n                new_quantity,\n                reference_type,\n                reference_id,\n                reason,\n                created_by\n            )\n            SELECT \n                sp.id,\n                'in',\n                supply_item.approved_quantity,\n                sp.stock_quantity - supply_item.approved_quantity,\n                sp.stock_quantity,\n                'supply_request',\n                NEW.id,\n                '물류 요청 배송 완료로 인한 재고 증가',\n                NEW.requested_by\n            FROM public.store_products sp\n            WHERE sp.store_id = supply_item.store_id \n                AND sp.product_id = supply_item.product_id;\n        END LOOP;\n    END IF;\n    \n    RETURN NEW;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"update_inventory_on_supply_delivery\\"() OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"update_store_product_stock\\"() RETURNS \\"trigger\\"\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nBEGIN\n    UPDATE store_products \n    SET stock_quantity = NEW.new_quantity,\n        updated_at = NOW()\n    WHERE id = NEW.store_product_id;\n    \n    RETURN NEW;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"update_store_product_stock\\"() OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"update_updated_at_column\\"() RETURNS \\"trigger\\"\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nBEGIN\n    NEW.updated_at = NOW();\n    RETURN NEW;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"update_updated_at_column\\"() OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"validate_order_service\\"() RETURNS \\"trigger\\"\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nBEGIN\n    -- 지점의 서비스 가능 여부 검증\n    IF NOT validate_store_service(NEW.store_id, NEW.type) THEN\n        RAISE EXCEPTION '선택한 지점에서 % 서비스를 이용할 수 없습니다.', \n            CASE NEW.type \n                WHEN 'delivery' THEN '배송'\n                WHEN 'pickup' THEN '픽업'\n                ELSE NEW.type\n            END;\n    END IF;\n    \n    RETURN NEW;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"validate_order_service\\"() OWNER TO \\"postgres\\"","CREATE OR REPLACE FUNCTION \\"public\\".\\"validate_store_service\\"(\\"p_store_id\\" \\"uuid\\", \\"p_service_type\\" \\"text\\") RETURNS boolean\n    LANGUAGE \\"plpgsql\\"\n    AS $$\nDECLARE\n    store_record RECORD;\nBEGIN\n    -- 지점 정보 조회\n    SELECT \n        is_active,\n        delivery_available,\n        pickup_available\n    INTO store_record\n    FROM stores\n    WHERE id = p_store_id;\n    \n    -- 지점이 존재하지 않거나 비활성화된 경우\n    IF NOT FOUND OR NOT store_record.is_active THEN\n        RETURN FALSE;\n    END IF;\n    \n    -- 서비스 타입에 따른 검증\n    CASE p_service_type\n        WHEN 'delivery' THEN\n            RETURN store_record.delivery_available;\n        WHEN 'pickup' THEN\n            RETURN store_record.pickup_available;\n        ELSE\n            RETURN FALSE;\n    END CASE;\nEND;\n$$","ALTER FUNCTION \\"public\\".\\"validate_store_service\\"(\\"p_store_id\\" \\"uuid\\", \\"p_service_type\\" \\"text\\") OWNER TO \\"postgres\\"","SET default_tablespace = ''","SET default_table_access_method = \\"heap\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"categories\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"name\\" \\"text\\" NOT NULL,\n    \\"slug\\" \\"text\\" NOT NULL,\n    \\"parent_id\\" \\"uuid\\",\n    \\"icon_url\\" \\"text\\",\n    \\"description\\" \\"text\\",\n    \\"display_order\\" integer DEFAULT 0,\n    \\"is_active\\" boolean DEFAULT true,\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    \\"updated_at\\" timestamp with time zone DEFAULT \\"now\\"()\n)","ALTER TABLE \\"public\\".\\"categories\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"orders\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"order_number\\" \\"text\\" NOT NULL,\n    \\"customer_id\\" \\"uuid\\",\n    \\"store_id\\" \\"uuid\\",\n    \\"type\\" \\"text\\" NOT NULL,\n    \\"status\\" \\"text\\" DEFAULT 'pending'::\\"text\\" NOT NULL,\n    \\"subtotal\\" numeric DEFAULT 0 NOT NULL,\n    \\"tax_amount\\" numeric DEFAULT 0 NOT NULL,\n    \\"delivery_fee\\" numeric DEFAULT 0,\n    \\"discount_amount\\" numeric DEFAULT 0,\n    \\"total_amount\\" numeric DEFAULT 0 NOT NULL,\n    \\"delivery_address\\" \\"jsonb\\",\n    \\"delivery_notes\\" \\"text\\",\n    \\"payment_method\\" \\"text\\",\n    \\"payment_status\\" \\"text\\" DEFAULT 'pending'::\\"text\\",\n    \\"payment_data\\" \\"jsonb\\" DEFAULT '{}'::\\"jsonb\\",\n    \\"pickup_time\\" timestamp with time zone,\n    \\"estimated_preparation_time\\" integer DEFAULT 0,\n    \\"completed_at\\" timestamp with time zone,\n    \\"cancelled_at\\" timestamp with time zone,\n    \\"notes\\" \\"text\\",\n    \\"cancel_reason\\" \\"text\\",\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    \\"updated_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    CONSTRAINT \\"orders_payment_method_check\\" CHECK ((\\"payment_method\\" = ANY (ARRAY['card'::\\"text\\", 'cash'::\\"text\\", 'kakao_pay'::\\"text\\", 'toss_pay'::\\"text\\", 'naver_pay'::\\"text\\"]))),\n    CONSTRAINT \\"orders_payment_status_check\\" CHECK ((\\"payment_status\\" = ANY (ARRAY['pending'::\\"text\\", 'paid'::\\"text\\", 'refunded'::\\"text\\", 'failed'::\\"text\\"]))),\n    CONSTRAINT \\"orders_status_check\\" CHECK ((\\"status\\" = ANY (ARRAY['pending'::\\"text\\", 'confirmed'::\\"text\\", 'preparing'::\\"text\\", 'ready'::\\"text\\", 'completed'::\\"text\\", 'cancelled'::\\"text\\"]))),\n    CONSTRAINT \\"orders_type_check\\" CHECK ((\\"type\\" = ANY (ARRAY['pickup'::\\"text\\", 'delivery'::\\"text\\"])))\n)","ALTER TABLE \\"public\\".\\"orders\\" OWNER TO \\"postgres\\"","CREATE OR REPLACE VIEW \\"public\\".\\"daily_sales_analytics\\" AS\n SELECT \\"date\\"(\\"created_at\\") AS \\"sale_date\\",\n    \\"count\\"(*) AS \\"total_orders\\",\n    \\"count\\"(\n        CASE\n            WHEN (\\"status\\" = 'completed'::\\"text\\") THEN 1\n            ELSE NULL::integer\n        END) AS \\"completed_orders\\",\n    \\"count\\"(\n        CASE\n            WHEN (\\"status\\" = 'cancelled'::\\"text\\") THEN 1\n            ELSE NULL::integer\n        END) AS \\"cancelled_orders\\",\n    \\"sum\\"(\n        CASE\n            WHEN (\\"status\\" = 'completed'::\\"text\\") THEN \\"total_amount\\"\n            ELSE (0)::numeric\n        END) AS \\"total_revenue\\",\n    \\"avg\\"(\n        CASE\n            WHEN (\\"status\\" = 'completed'::\\"text\\") THEN \\"total_amount\\"\n            ELSE NULL::numeric\n        END) AS \\"avg_order_value\\",\n    \\"count\\"(\n        CASE\n            WHEN (\\"type\\" = 'pickup'::\\"text\\") THEN 1\n            ELSE NULL::integer\n        END) AS \\"pickup_orders\\",\n    \\"count\\"(\n        CASE\n            WHEN (\\"type\\" = 'delivery'::\\"text\\") THEN 1\n            ELSE NULL::integer\n        END) AS \\"delivery_orders\\"\n   FROM \\"public\\".\\"orders\\" \\"o\\"\n  GROUP BY (\\"date\\"(\\"created_at\\"))\n  ORDER BY (\\"date\\"(\\"created_at\\")) DESC","ALTER VIEW \\"public\\".\\"daily_sales_analytics\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"daily_sales_summary\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"store_id\\" \\"uuid\\",\n    \\"date\\" \\"date\\" NOT NULL,\n    \\"total_orders\\" integer DEFAULT 0,\n    \\"pickup_orders\\" integer DEFAULT 0,\n    \\"delivery_orders\\" integer DEFAULT 0,\n    \\"cancelled_orders\\" integer DEFAULT 0,\n    \\"total_revenue\\" numeric DEFAULT 0,\n    \\"total_items_sold\\" integer DEFAULT 0,\n    \\"avg_order_value\\" numeric DEFAULT 0,\n    \\"hourly_stats\\" \\"jsonb\\" DEFAULT '{}'::\\"jsonb\\",\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    \\"updated_at\\" timestamp with time zone DEFAULT \\"now\\"()\n)","ALTER TABLE \\"public\\".\\"daily_sales_summary\\" OWNER TO \\"postgres\\"","CREATE OR REPLACE VIEW \\"public\\".\\"hourly_sales_analytics\\" AS\n SELECT EXTRACT(hour FROM \\"created_at\\") AS \\"hour_of_day\\",\n    \\"count\\"(*) AS \\"total_orders\\",\n    \\"sum\\"(\n        CASE\n            WHEN (\\"status\\" = 'completed'::\\"text\\") THEN \\"total_amount\\"\n            ELSE (0)::numeric\n        END) AS \\"total_revenue\\",\n    \\"avg\\"(\n        CASE\n            WHEN (\\"status\\" = 'completed'::\\"text\\") THEN \\"total_amount\\"\n            ELSE NULL::numeric\n        END) AS \\"avg_order_value\\"\n   FROM \\"public\\".\\"orders\\" \\"o\\"\n  GROUP BY (EXTRACT(hour FROM \\"created_at\\"))\n  ORDER BY (EXTRACT(hour FROM \\"created_at\\"))","ALTER VIEW \\"public\\".\\"hourly_sales_analytics\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"inventory_transactions\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"store_product_id\\" \\"uuid\\",\n    \\"transaction_type\\" \\"text\\" NOT NULL,\n    \\"quantity\\" integer NOT NULL,\n    \\"previous_quantity\\" integer NOT NULL,\n    \\"new_quantity\\" integer NOT NULL,\n    \\"reference_type\\" \\"text\\",\n    \\"reference_id\\" \\"uuid\\",\n    \\"unit_cost\\" numeric DEFAULT 0,\n    \\"total_cost\\" numeric DEFAULT 0,\n    \\"reason\\" \\"text\\",\n    \\"notes\\" \\"text\\",\n    \\"created_by\\" \\"uuid\\",\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    CONSTRAINT \\"inventory_transactions_transaction_type_check\\" CHECK ((\\"transaction_type\\" = ANY (ARRAY['in'::\\"text\\", 'out'::\\"text\\", 'adjustment'::\\"text\\", 'expired'::\\"text\\", 'damaged'::\\"text\\", 'returned'::\\"text\\"])))\n)","ALTER TABLE \\"public\\".\\"inventory_transactions\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"notifications\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"user_id\\" \\"uuid\\",\n    \\"type\\" \\"text\\" NOT NULL,\n    \\"title\\" \\"text\\" NOT NULL,\n    \\"message\\" \\"text\\" NOT NULL,\n    \\"data\\" \\"jsonb\\" DEFAULT '{}'::\\"jsonb\\",\n    \\"priority\\" \\"text\\" DEFAULT 'normal'::\\"text\\",\n    \\"is_read\\" boolean DEFAULT false,\n    \\"read_at\\" timestamp with time zone,\n    \\"expires_at\\" timestamp with time zone,\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    CONSTRAINT \\"notifications_priority_check\\" CHECK ((\\"priority\\" = ANY (ARRAY['low'::\\"text\\", 'normal'::\\"text\\", 'high'::\\"text\\", 'urgent'::\\"text\\"])))\n)","ALTER TABLE \\"public\\".\\"notifications\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"order_items\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"order_id\\" \\"uuid\\",\n    \\"product_id\\" \\"uuid\\",\n    \\"product_name\\" \\"text\\" NOT NULL,\n    \\"quantity\\" integer NOT NULL,\n    \\"unit_price\\" numeric NOT NULL,\n    \\"discount_amount\\" numeric DEFAULT 0,\n    \\"subtotal\\" numeric NOT NULL,\n    \\"options\\" \\"jsonb\\" DEFAULT '{}'::\\"jsonb\\",\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    CONSTRAINT \\"order_items_quantity_check\\" CHECK ((\\"quantity\\" > 0))\n)","ALTER TABLE \\"public\\".\\"order_items\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"order_status_history\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"order_id\\" \\"uuid\\",\n    \\"status\\" \\"text\\" NOT NULL,\n    \\"changed_by\\" \\"uuid\\",\n    \\"notes\\" \\"text\\",\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"()\n)","ALTER TABLE \\"public\\".\\"order_status_history\\" OWNER TO \\"postgres\\"","CREATE OR REPLACE VIEW \\"public\\".\\"payment_method_analytics\\" AS\n SELECT \\"payment_method\\",\n    \\"count\\"(*) AS \\"total_orders\\",\n    \\"sum\\"(\n        CASE\n            WHEN (\\"status\\" = 'completed'::\\"text\\") THEN \\"total_amount\\"\n            ELSE (0)::numeric\n        END) AS \\"total_revenue\\",\n    \\"avg\\"(\n        CASE\n            WHEN (\\"status\\" = 'completed'::\\"text\\") THEN \\"total_amount\\"\n            ELSE NULL::numeric\n        END) AS \\"avg_order_value\\",\n    \\"count\\"(\n        CASE\n            WHEN (\\"payment_status\\" = 'paid'::\\"text\\") THEN 1\n            ELSE NULL::integer\n        END) AS \\"paid_orders\\",\n    \\"count\\"(\n        CASE\n            WHEN (\\"payment_status\\" = 'failed'::\\"text\\") THEN 1\n            ELSE NULL::integer\n        END) AS \\"failed_orders\\"\n   FROM \\"public\\".\\"orders\\" \\"o\\"\n  GROUP BY \\"payment_method\\"\n  ORDER BY (\\"sum\\"(\n        CASE\n            WHEN (\\"status\\" = 'completed'::\\"text\\") THEN \\"total_amount\\"\n            ELSE (0)::numeric\n        END)) DESC","ALTER VIEW \\"public\\".\\"payment_method_analytics\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"products\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"name\\" \\"text\\" NOT NULL,\n    \\"description\\" \\"text\\",\n    \\"barcode\\" \\"text\\",\n    \\"category_id\\" \\"uuid\\",\n    \\"brand\\" \\"text\\",\n    \\"manufacturer\\" \\"text\\",\n    \\"unit\\" \\"text\\" DEFAULT '개'::\\"text\\" NOT NULL,\n    \\"image_urls\\" \\"text\\"[] DEFAULT '{}'::\\"text\\"[],\n    \\"base_price\\" numeric NOT NULL,\n    \\"cost_price\\" numeric,\n    \\"tax_rate\\" numeric DEFAULT 0.10,\n    \\"is_active\\" boolean DEFAULT true,\n    \\"requires_preparation\\" boolean DEFAULT false,\n    \\"preparation_time\\" integer DEFAULT 0,\n    \\"nutritional_info\\" \\"jsonb\\" DEFAULT '{}'::\\"jsonb\\",\n    \\"allergen_info\\" \\"text\\"[],\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    \\"updated_at\\" timestamp with time zone DEFAULT \\"now\\"()\n)","ALTER TABLE \\"public\\".\\"products\\" OWNER TO \\"postgres\\"","CREATE OR REPLACE VIEW \\"public\\".\\"product_sales_analytics\\" AS\n SELECT \\"p\\".\\"id\\" AS \\"product_id\\",\n    \\"p\\".\\"name\\" AS \\"product_name\\",\n    \\"c\\".\\"name\\" AS \\"category_name\\",\n    \\"count\\"(\\"oi\\".\\"id\\") AS \\"total_sold\\",\n    \\"sum\\"(\\"oi\\".\\"subtotal\\") AS \\"total_revenue\\",\n    \\"avg\\"(\\"oi\\".\\"unit_price\\") AS \\"avg_price\\",\n    \\"count\\"(DISTINCT \\"o\\".\\"id\\") AS \\"order_count\\"\n   FROM (((\\"public\\".\\"products\\" \\"p\\"\n     LEFT JOIN \\"public\\".\\"categories\\" \\"c\\" ON ((\\"p\\".\\"category_id\\" = \\"c\\".\\"id\\")))\n     LEFT JOIN \\"public\\".\\"order_items\\" \\"oi\\" ON ((\\"p\\".\\"id\\" = \\"oi\\".\\"product_id\\")))\n     LEFT JOIN \\"public\\".\\"orders\\" \\"o\\" ON (((\\"oi\\".\\"order_id\\" = \\"o\\".\\"id\\") AND (\\"o\\".\\"status\\" = 'completed'::\\"text\\"))))\n  GROUP BY \\"p\\".\\"id\\", \\"p\\".\\"name\\", \\"c\\".\\"name\\"\n  ORDER BY (\\"sum\\"(\\"oi\\".\\"subtotal\\")) DESC","ALTER VIEW \\"public\\".\\"product_sales_analytics\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"product_sales_summary\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"store_id\\" \\"uuid\\",\n    \\"product_id\\" \\"uuid\\",\n    \\"date\\" \\"date\\" NOT NULL,\n    \\"quantity_sold\\" integer DEFAULT 0,\n    \\"revenue\\" numeric DEFAULT 0,\n    \\"avg_price\\" numeric DEFAULT 0,\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"()\n)","ALTER TABLE \\"public\\".\\"product_sales_summary\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"profiles\\" (\n    \\"id\\" \\"uuid\\" NOT NULL,\n    \\"role\\" \\"text\\" NOT NULL,\n    \\"full_name\\" \\"text\\" NOT NULL,\n    \\"phone\\" \\"text\\",\n    \\"avatar_url\\" \\"text\\",\n    \\"address\\" \\"jsonb\\",\n    \\"preferences\\" \\"jsonb\\" DEFAULT '{}'::\\"jsonb\\",\n    \\"is_active\\" boolean DEFAULT true,\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    \\"updated_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    CONSTRAINT \\"profiles_role_check\\" CHECK ((\\"role\\" = ANY (ARRAY['customer'::\\"text\\", 'store_owner'::\\"text\\", 'headquarters'::\\"text\\"])))\n)","ALTER TABLE \\"public\\".\\"profiles\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"shipments\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"shipment_number\\" \\"text\\" NOT NULL,\n    \\"supply_request_id\\" \\"uuid\\",\n    \\"status\\" \\"text\\" DEFAULT 'preparing'::\\"text\\" NOT NULL,\n    \\"carrier\\" \\"text\\",\n    \\"tracking_number\\" \\"text\\",\n    \\"shipped_at\\" timestamp with time zone,\n    \\"estimated_delivery\\" timestamp with time zone,\n    \\"delivered_at\\" timestamp with time zone,\n    \\"notes\\" \\"text\\",\n    \\"failure_reason\\" \\"text\\",\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    \\"updated_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    CONSTRAINT \\"shipments_status_check\\" CHECK ((\\"status\\" = ANY (ARRAY['preparing'::\\"text\\", 'shipped'::\\"text\\", 'in_transit'::\\"text\\", 'delivered'::\\"text\\", 'failed'::\\"text\\"])))\n)","ALTER TABLE \\"public\\".\\"shipments\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"store_products\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"store_id\\" \\"uuid\\",\n    \\"product_id\\" \\"uuid\\",\n    \\"price\\" numeric NOT NULL,\n    \\"stock_quantity\\" integer DEFAULT 0 NOT NULL,\n    \\"safety_stock\\" integer DEFAULT 10,\n    \\"max_stock\\" integer DEFAULT 100,\n    \\"is_available\\" boolean DEFAULT true,\n    \\"discount_rate\\" numeric DEFAULT 0,\n    \\"promotion_start_date\\" timestamp with time zone,\n    \\"promotion_end_date\\" timestamp with time zone,\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    \\"updated_at\\" timestamp with time zone DEFAULT \\"now\\"()\n)","ALTER TABLE \\"public\\".\\"store_products\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"stores\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"name\\" \\"text\\" NOT NULL,\n    \\"owner_id\\" \\"uuid\\",\n    \\"address\\" \\"text\\" NOT NULL,\n    \\"phone\\" \\"text\\" NOT NULL,\n    \\"business_hours\\" \\"jsonb\\" DEFAULT '{}'::\\"jsonb\\" NOT NULL,\n    \\"location\\" \\"public\\".\\"geography\\"(Point,4326),\n    \\"delivery_available\\" boolean DEFAULT true,\n    \\"pickup_available\\" boolean DEFAULT true,\n    \\"delivery_radius\\" integer DEFAULT 3000,\n    \\"min_order_amount\\" numeric DEFAULT 0,\n    \\"delivery_fee\\" numeric DEFAULT 0,\n    \\"is_active\\" boolean DEFAULT true,\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    \\"updated_at\\" timestamp with time zone DEFAULT \\"now\\"()\n)","ALTER TABLE \\"public\\".\\"stores\\" OWNER TO \\"postgres\\"","CREATE OR REPLACE VIEW \\"public\\".\\"store_sales_analytics\\" AS\n SELECT \\"s\\".\\"id\\" AS \\"store_id\\",\n    \\"s\\".\\"name\\" AS \\"store_name\\",\n    \\"count\\"(\\"o\\".\\"id\\") AS \\"total_orders\\",\n    \\"count\\"(\n        CASE\n            WHEN (\\"o\\".\\"status\\" = 'completed'::\\"text\\") THEN 1\n            ELSE NULL::integer\n        END) AS \\"completed_orders\\",\n    \\"sum\\"(\n        CASE\n            WHEN (\\"o\\".\\"status\\" = 'completed'::\\"text\\") THEN \\"o\\".\\"total_amount\\"\n            ELSE (0)::numeric\n        END) AS \\"total_revenue\\",\n    \\"avg\\"(\n        CASE\n            WHEN (\\"o\\".\\"status\\" = 'completed'::\\"text\\") THEN \\"o\\".\\"total_amount\\"\n            ELSE NULL::numeric\n        END) AS \\"avg_order_value\\",\n    \\"count\\"(\n        CASE\n            WHEN (\\"o\\".\\"type\\" = 'pickup'::\\"text\\") THEN 1\n            ELSE NULL::integer\n        END) AS \\"pickup_orders\\",\n    \\"count\\"(\n        CASE\n            WHEN (\\"o\\".\\"type\\" = 'delivery'::\\"text\\") THEN 1\n            ELSE NULL::integer\n        END) AS \\"delivery_orders\\",\n    \\"max\\"(\\"o\\".\\"created_at\\") AS \\"last_order_date\\"\n   FROM (\\"public\\".\\"stores\\" \\"s\\"\n     LEFT JOIN \\"public\\".\\"orders\\" \\"o\\" ON ((\\"s\\".\\"id\\" = \\"o\\".\\"store_id\\")))\n  GROUP BY \\"s\\".\\"id\\", \\"s\\".\\"name\\"\n  ORDER BY (\\"sum\\"(\n        CASE\n            WHEN (\\"o\\".\\"status\\" = 'completed'::\\"text\\") THEN \\"o\\".\\"total_amount\\"\n            ELSE (0)::numeric\n        END)) DESC","ALTER VIEW \\"public\\".\\"store_sales_analytics\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"supply_request_items\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"supply_request_id\\" \\"uuid\\",\n    \\"product_id\\" \\"uuid\\",\n    \\"product_name\\" \\"text\\" NOT NULL,\n    \\"requested_quantity\\" integer NOT NULL,\n    \\"approved_quantity\\" integer DEFAULT 0,\n    \\"unit_cost\\" numeric DEFAULT 0,\n    \\"total_cost\\" numeric DEFAULT 0,\n    \\"reason\\" \\"text\\",\n    \\"current_stock\\" integer DEFAULT 0,\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    CONSTRAINT \\"supply_request_items_approved_quantity_check\\" CHECK ((\\"approved_quantity\\" >= 0)),\n    CONSTRAINT \\"supply_request_items_requested_quantity_check\\" CHECK ((\\"requested_quantity\\" > 0))\n)","ALTER TABLE \\"public\\".\\"supply_request_items\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"supply_requests\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"request_number\\" \\"text\\" NOT NULL,\n    \\"store_id\\" \\"uuid\\",\n    \\"requested_by\\" \\"uuid\\",\n    \\"status\\" \\"text\\" DEFAULT 'draft'::\\"text\\" NOT NULL,\n    \\"priority\\" \\"text\\" DEFAULT 'normal'::\\"text\\",\n    \\"total_amount\\" numeric DEFAULT 0,\n    \\"approved_amount\\" numeric DEFAULT 0,\n    \\"expected_delivery_date\\" \\"date\\",\n    \\"actual_delivery_date\\" \\"date\\",\n    \\"approved_by\\" \\"uuid\\",\n    \\"approved_at\\" timestamp with time zone,\n    \\"notes\\" \\"text\\",\n    \\"rejection_reason\\" \\"text\\",\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    \\"updated_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    CONSTRAINT \\"supply_requests_priority_check\\" CHECK ((\\"priority\\" = ANY (ARRAY['low'::\\"text\\", 'normal'::\\"text\\", 'high'::\\"text\\", 'urgent'::\\"text\\"]))),\n    CONSTRAINT \\"supply_requests_status_check\\" CHECK ((\\"status\\" = ANY (ARRAY['draft'::\\"text\\", 'submitted'::\\"text\\", 'approved'::\\"text\\", 'rejected'::\\"text\\", 'shipped'::\\"text\\", 'delivered'::\\"text\\", 'cancelled'::\\"text\\"])))\n)","ALTER TABLE \\"public\\".\\"supply_requests\\" OWNER TO \\"postgres\\"","CREATE TABLE IF NOT EXISTS \\"public\\".\\"system_settings\\" (\n    \\"id\\" \\"uuid\\" DEFAULT \\"gen_random_uuid\\"() NOT NULL,\n    \\"key\\" \\"text\\" NOT NULL,\n    \\"value\\" \\"jsonb\\" NOT NULL,\n    \\"description\\" \\"text\\",\n    \\"category\\" \\"text\\" DEFAULT 'general'::\\"text\\",\n    \\"is_public\\" boolean DEFAULT false,\n    \\"created_at\\" timestamp with time zone DEFAULT \\"now\\"(),\n    \\"updated_at\\" timestamp with time zone DEFAULT \\"now\\"()\n)","ALTER TABLE \\"public\\".\\"system_settings\\" OWNER TO \\"postgres\\"","ALTER TABLE ONLY \\"public\\".\\"categories\\"\n    ADD CONSTRAINT \\"categories_name_key\\" UNIQUE (\\"name\\")","ALTER TABLE ONLY \\"public\\".\\"categories\\"\n    ADD CONSTRAINT \\"categories_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"categories\\"\n    ADD CONSTRAINT \\"categories_slug_key\\" UNIQUE (\\"slug\\")","ALTER TABLE ONLY \\"public\\".\\"daily_sales_summary\\"\n    ADD CONSTRAINT \\"daily_sales_summary_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"inventory_transactions\\"\n    ADD CONSTRAINT \\"inventory_transactions_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"notifications\\"\n    ADD CONSTRAINT \\"notifications_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"order_items\\"\n    ADD CONSTRAINT \\"order_items_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"order_status_history\\"\n    ADD CONSTRAINT \\"order_status_history_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"orders\\"\n    ADD CONSTRAINT \\"orders_order_number_key\\" UNIQUE (\\"order_number\\")","ALTER TABLE ONLY \\"public\\".\\"orders\\"\n    ADD CONSTRAINT \\"orders_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"product_sales_summary\\"\n    ADD CONSTRAINT \\"product_sales_summary_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"products\\"\n    ADD CONSTRAINT \\"products_barcode_key\\" UNIQUE (\\"barcode\\")","ALTER TABLE ONLY \\"public\\".\\"products\\"\n    ADD CONSTRAINT \\"products_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"profiles\\"\n    ADD CONSTRAINT \\"profiles_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"shipments\\"\n    ADD CONSTRAINT \\"shipments_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"shipments\\"\n    ADD CONSTRAINT \\"shipments_shipment_number_key\\" UNIQUE (\\"shipment_number\\")","ALTER TABLE ONLY \\"public\\".\\"store_products\\"\n    ADD CONSTRAINT \\"store_products_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"stores\\"\n    ADD CONSTRAINT \\"stores_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"supply_request_items\\"\n    ADD CONSTRAINT \\"supply_request_items_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"supply_requests\\"\n    ADD CONSTRAINT \\"supply_requests_pkey\\" PRIMARY KEY (\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"supply_requests\\"\n    ADD CONSTRAINT \\"supply_requests_request_number_key\\" UNIQUE (\\"request_number\\")","ALTER TABLE ONLY \\"public\\".\\"system_settings\\"\n    ADD CONSTRAINT \\"system_settings_key_key\\" UNIQUE (\\"key\\")","ALTER TABLE ONLY \\"public\\".\\"system_settings\\"\n    ADD CONSTRAINT \\"system_settings_pkey\\" PRIMARY KEY (\\"id\\")","CREATE INDEX \\"idx_categories_parent_id\\" ON \\"public\\".\\"categories\\" USING \\"btree\\" (\\"parent_id\\")","CREATE INDEX \\"idx_daily_sales_summary_store_date\\" ON \\"public\\".\\"daily_sales_summary\\" USING \\"btree\\" (\\"store_id\\", \\"date\\")","CREATE INDEX \\"idx_inventory_transactions_store_product_id\\" ON \\"public\\".\\"inventory_transactions\\" USING \\"btree\\" (\\"store_product_id\\")","CREATE INDEX \\"idx_notifications_user_id\\" ON \\"public\\".\\"notifications\\" USING \\"btree\\" (\\"user_id\\")","CREATE INDEX \\"idx_order_items_order_id\\" ON \\"public\\".\\"order_items\\" USING \\"btree\\" (\\"order_id\\")","CREATE INDEX \\"idx_order_status_history_order_id\\" ON \\"public\\".\\"order_status_history\\" USING \\"btree\\" (\\"order_id\\")","CREATE INDEX \\"idx_orders_customer_created\\" ON \\"public\\".\\"orders\\" USING \\"btree\\" (\\"customer_id\\", \\"created_at\\")","CREATE INDEX \\"idx_orders_customer_id\\" ON \\"public\\".\\"orders\\" USING \\"btree\\" (\\"customer_id\\")","CREATE INDEX \\"idx_orders_payment_key\\" ON \\"public\\".\\"orders\\" USING \\"btree\\" (((\\"payment_data\\" ->> 'paymentKey'::\\"text\\")))","CREATE INDEX \\"idx_orders_status\\" ON \\"public\\".\\"orders\\" USING \\"btree\\" (\\"status\\")","CREATE INDEX \\"idx_orders_store_id\\" ON \\"public\\".\\"orders\\" USING \\"btree\\" (\\"store_id\\")","CREATE INDEX \\"idx_product_sales_summary_store_product_date\\" ON \\"public\\".\\"product_sales_summary\\" USING \\"btree\\" (\\"store_id\\", \\"product_id\\", \\"date\\")","CREATE INDEX \\"idx_products_category_id\\" ON \\"public\\".\\"products\\" USING \\"btree\\" (\\"category_id\\")","CREATE INDEX \\"idx_profiles_role\\" ON \\"public\\".\\"profiles\\" USING \\"btree\\" (\\"role\\")","CREATE INDEX \\"idx_store_products_store_id\\" ON \\"public\\".\\"store_products\\" USING \\"btree\\" (\\"store_id\\")","CREATE INDEX \\"idx_stores_owner_id\\" ON \\"public\\".\\"stores\\" USING \\"btree\\" (\\"owner_id\\")","CREATE INDEX \\"idx_supply_requests_store_id\\" ON \\"public\\".\\"supply_requests\\" USING \\"btree\\" (\\"store_id\\")","CREATE OR REPLACE TRIGGER \\"log_order_status_change_trigger\\" AFTER UPDATE ON \\"public\\".\\"orders\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"log_order_status_change\\"()","CREATE OR REPLACE TRIGGER \\"set_order_number_trigger\\" BEFORE INSERT ON \\"public\\".\\"orders\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"generate_order_number\\"()","CREATE OR REPLACE TRIGGER \\"set_shipment_number_trigger\\" BEFORE INSERT ON \\"public\\".\\"shipments\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"generate_shipment_number\\"()","CREATE OR REPLACE TRIGGER \\"set_supply_request_number_trigger\\" BEFORE INSERT ON \\"public\\".\\"supply_requests\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"generate_supply_request_number\\"()","CREATE OR REPLACE TRIGGER \\"trigger_initialize_store_products\\" AFTER INSERT ON \\"public\\".\\"stores\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"initialize_store_products\\"()","CREATE OR REPLACE TRIGGER \\"trigger_low_stock_check\\" AFTER UPDATE ON \\"public\\".\\"store_products\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"check_low_stock\\"()","CREATE OR REPLACE TRIGGER \\"trigger_order_completion\\" AFTER UPDATE ON \\"public\\".\\"orders\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"handle_order_completion\\"()","CREATE OR REPLACE TRIGGER \\"trigger_prevent_duplicate_orders\\" BEFORE INSERT ON \\"public\\".\\"orders\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"prevent_duplicate_orders\\"()","CREATE OR REPLACE TRIGGER \\"trigger_shipment_delivery\\" AFTER UPDATE ON \\"public\\".\\"shipments\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"handle_shipment_delivery\\"()","CREATE OR REPLACE TRIGGER \\"trigger_update_inventory_on_supply_delivery\\" AFTER UPDATE ON \\"public\\".\\"supply_requests\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"update_inventory_on_supply_delivery\\"()","CREATE OR REPLACE TRIGGER \\"trigger_validate_order_service\\" BEFORE INSERT ON \\"public\\".\\"orders\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"validate_order_service\\"()","CREATE OR REPLACE TRIGGER \\"update_categories_updated_at\\" BEFORE UPDATE ON \\"public\\".\\"categories\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"update_updated_at_column\\"()","CREATE OR REPLACE TRIGGER \\"update_daily_sales_summary_updated_at\\" BEFORE UPDATE ON \\"public\\".\\"daily_sales_summary\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"update_updated_at_column\\"()","CREATE OR REPLACE TRIGGER \\"update_orders_updated_at\\" BEFORE UPDATE ON \\"public\\".\\"orders\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"update_updated_at_column\\"()","CREATE OR REPLACE TRIGGER \\"update_products_updated_at\\" BEFORE UPDATE ON \\"public\\".\\"products\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"update_updated_at_column\\"()","CREATE OR REPLACE TRIGGER \\"update_profiles_updated_at\\" BEFORE UPDATE ON \\"public\\".\\"profiles\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"update_updated_at_column\\"()","CREATE OR REPLACE TRIGGER \\"update_shipments_updated_at\\" BEFORE UPDATE ON \\"public\\".\\"shipments\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"update_updated_at_column\\"()","CREATE OR REPLACE TRIGGER \\"update_store_product_stock_trigger\\" AFTER INSERT ON \\"public\\".\\"inventory_transactions\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"update_store_product_stock\\"()","CREATE OR REPLACE TRIGGER \\"update_store_products_updated_at\\" BEFORE UPDATE ON \\"public\\".\\"store_products\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"update_updated_at_column\\"()","CREATE OR REPLACE TRIGGER \\"update_stores_updated_at\\" BEFORE UPDATE ON \\"public\\".\\"stores\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"update_updated_at_column\\"()","CREATE OR REPLACE TRIGGER \\"update_supply_requests_updated_at\\" BEFORE UPDATE ON \\"public\\".\\"supply_requests\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"update_updated_at_column\\"()","CREATE OR REPLACE TRIGGER \\"update_system_settings_updated_at\\" BEFORE UPDATE ON \\"public\\".\\"system_settings\\" FOR EACH ROW EXECUTE FUNCTION \\"public\\".\\"update_updated_at_column\\"()","ALTER TABLE ONLY \\"public\\".\\"categories\\"\n    ADD CONSTRAINT \\"categories_parent_id_fkey\\" FOREIGN KEY (\\"parent_id\\") REFERENCES \\"public\\".\\"categories\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"daily_sales_summary\\"\n    ADD CONSTRAINT \\"daily_sales_summary_store_id_fkey\\" FOREIGN KEY (\\"store_id\\") REFERENCES \\"public\\".\\"stores\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"inventory_transactions\\"\n    ADD CONSTRAINT \\"inventory_transactions_created_by_fkey\\" FOREIGN KEY (\\"created_by\\") REFERENCES \\"public\\".\\"profiles\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"inventory_transactions\\"\n    ADD CONSTRAINT \\"inventory_transactions_store_product_id_fkey\\" FOREIGN KEY (\\"store_product_id\\") REFERENCES \\"public\\".\\"store_products\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"notifications\\"\n    ADD CONSTRAINT \\"notifications_user_id_fkey\\" FOREIGN KEY (\\"user_id\\") REFERENCES \\"public\\".\\"profiles\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"order_items\\"\n    ADD CONSTRAINT \\"order_items_order_id_fkey\\" FOREIGN KEY (\\"order_id\\") REFERENCES \\"public\\".\\"orders\\"(\\"id\\") ON DELETE CASCADE","ALTER TABLE ONLY \\"public\\".\\"order_items\\"\n    ADD CONSTRAINT \\"order_items_product_id_fkey\\" FOREIGN KEY (\\"product_id\\") REFERENCES \\"public\\".\\"products\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"order_status_history\\"\n    ADD CONSTRAINT \\"order_status_history_changed_by_fkey\\" FOREIGN KEY (\\"changed_by\\") REFERENCES \\"public\\".\\"profiles\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"order_status_history\\"\n    ADD CONSTRAINT \\"order_status_history_order_id_fkey\\" FOREIGN KEY (\\"order_id\\") REFERENCES \\"public\\".\\"orders\\"(\\"id\\") ON DELETE CASCADE","ALTER TABLE ONLY \\"public\\".\\"orders\\"\n    ADD CONSTRAINT \\"orders_customer_id_fkey\\" FOREIGN KEY (\\"customer_id\\") REFERENCES \\"public\\".\\"profiles\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"orders\\"\n    ADD CONSTRAINT \\"orders_store_id_fkey\\" FOREIGN KEY (\\"store_id\\") REFERENCES \\"public\\".\\"stores\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"product_sales_summary\\"\n    ADD CONSTRAINT \\"product_sales_summary_product_id_fkey\\" FOREIGN KEY (\\"product_id\\") REFERENCES \\"public\\".\\"products\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"product_sales_summary\\"\n    ADD CONSTRAINT \\"product_sales_summary_store_id_fkey\\" FOREIGN KEY (\\"store_id\\") REFERENCES \\"public\\".\\"stores\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"products\\"\n    ADD CONSTRAINT \\"products_category_id_fkey\\" FOREIGN KEY (\\"category_id\\") REFERENCES \\"public\\".\\"categories\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"shipments\\"\n    ADD CONSTRAINT \\"shipments_supply_request_id_fkey\\" FOREIGN KEY (\\"supply_request_id\\") REFERENCES \\"public\\".\\"supply_requests\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"store_products\\"\n    ADD CONSTRAINT \\"store_products_product_id_fkey\\" FOREIGN KEY (\\"product_id\\") REFERENCES \\"public\\".\\"products\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"store_products\\"\n    ADD CONSTRAINT \\"store_products_store_id_fkey\\" FOREIGN KEY (\\"store_id\\") REFERENCES \\"public\\".\\"stores\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"stores\\"\n    ADD CONSTRAINT \\"stores_owner_id_fkey\\" FOREIGN KEY (\\"owner_id\\") REFERENCES \\"public\\".\\"profiles\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"supply_request_items\\"\n    ADD CONSTRAINT \\"supply_request_items_product_id_fkey\\" FOREIGN KEY (\\"product_id\\") REFERENCES \\"public\\".\\"products\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"supply_request_items\\"\n    ADD CONSTRAINT \\"supply_request_items_supply_request_id_fkey\\" FOREIGN KEY (\\"supply_request_id\\") REFERENCES \\"public\\".\\"supply_requests\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"supply_requests\\"\n    ADD CONSTRAINT \\"supply_requests_approved_by_fkey\\" FOREIGN KEY (\\"approved_by\\") REFERENCES \\"public\\".\\"profiles\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"supply_requests\\"\n    ADD CONSTRAINT \\"supply_requests_requested_by_fkey\\" FOREIGN KEY (\\"requested_by\\") REFERENCES \\"public\\".\\"profiles\\"(\\"id\\")","ALTER TABLE ONLY \\"public\\".\\"supply_requests\\"\n    ADD CONSTRAINT \\"supply_requests_store_id_fkey\\" FOREIGN KEY (\\"store_id\\") REFERENCES \\"public\\".\\"stores\\"(\\"id\\")","CREATE POLICY \\"Allow creating notifications for users\\" ON \\"public\\".\\"notifications\\" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1\n   FROM (\\"public\\".\\"orders\\" \\"o\\"\n     JOIN \\"public\\".\\"stores\\" \\"s\\" ON ((\\"s\\".\\"id\\" = \\"o\\".\\"store_id\\")))\n  WHERE ((\\"o\\".\\"customer_id\\" = \\"notifications\\".\\"user_id\\") AND (\\"s\\".\\"owner_id\\" = \\"auth\\".\\"uid\\"())))) OR (EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\" \\"p\\"\n  WHERE ((\\"p\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"p\\".\\"role\\" = 'headquarters'::\\"text\\")))) OR (\\"auth\\".\\"uid\\"() IS NULL)))","CREATE POLICY \\"Anyone can view active stores\\" ON \\"public\\".\\"stores\\" FOR SELECT USING ((\\"is_active\\" = true))","CREATE POLICY \\"Anyone can view categories\\" ON \\"public\\".\\"categories\\" FOR SELECT USING (true)","CREATE POLICY \\"Anyone can view products\\" ON \\"public\\".\\"products\\" FOR SELECT USING (true)","CREATE POLICY \\"Anyone can view public settings\\" ON \\"public\\".\\"system_settings\\" FOR SELECT USING ((\\"is_public\\" = true))","CREATE POLICY \\"Customers can create inventory transactions for own orders\\" ON \\"public\\".\\"inventory_transactions\\" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"orders\\" \\"o\\"\n  WHERE ((\\"o\\".\\"id\\" = \\"inventory_transactions\\".\\"reference_id\\") AND (\\"o\\".\\"customer_id\\" = \\"auth\\".\\"uid\\"()) AND (\\"inventory_transactions\\".\\"reference_type\\" = 'order'::\\"text\\")))))","CREATE POLICY \\"Customers can create order items for own orders\\" ON \\"public\\".\\"order_items\\" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"orders\\" \\"o\\"\n  WHERE ((\\"o\\".\\"id\\" = \\"order_items\\".\\"order_id\\") AND (\\"o\\".\\"customer_id\\" = \\"auth\\".\\"uid\\"())))))","CREATE POLICY \\"Customers can create own orders\\" ON \\"public\\".\\"orders\\" FOR INSERT WITH CHECK ((\\"customer_id\\" = \\"auth\\".\\"uid\\"()))","CREATE POLICY \\"Customers can delete own order items\\" ON \\"public\\".\\"order_items\\" FOR DELETE USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"orders\\" \\"o\\"\n  WHERE ((\\"o\\".\\"id\\" = \\"order_items\\".\\"order_id\\") AND (\\"o\\".\\"customer_id\\" = \\"auth\\".\\"uid\\"())))))","CREATE POLICY \\"Customers can delete own orders\\" ON \\"public\\".\\"orders\\" FOR DELETE USING ((\\"customer_id\\" = \\"auth\\".\\"uid\\"()))","CREATE POLICY \\"Customers can view available store products\\" ON \\"public\\".\\"store_products\\" FOR SELECT USING (((\\"is_available\\" = true) AND (EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\"\n  WHERE ((\\"profiles\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"profiles\\".\\"role\\" = 'customer'::\\"text\\"))))))","CREATE POLICY \\"Customers can view own orders\\" ON \\"public\\".\\"orders\\" FOR SELECT USING ((\\"customer_id\\" = \\"auth\\".\\"uid\\"()))","CREATE POLICY \\"HQ can manage all inventory transactions\\" ON \\"public\\".\\"inventory_transactions\\" USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\"\n  WHERE ((\\"profiles\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"profiles\\".\\"role\\" = 'headquarters'::\\"text\\")))))","CREATE POLICY \\"HQ can manage all settings\\" ON \\"public\\".\\"system_settings\\" USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\"\n  WHERE ((\\"profiles\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"profiles\\".\\"role\\" = 'headquarters'::\\"text\\")))))","CREATE POLICY \\"HQ can manage all store products\\" ON \\"public\\".\\"store_products\\" USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\"\n  WHERE ((\\"profiles\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"profiles\\".\\"role\\" = 'headquarters'::\\"text\\")))))","CREATE POLICY \\"HQ can manage all stores\\" ON \\"public\\".\\"stores\\" USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\"\n  WHERE ((\\"profiles\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"profiles\\".\\"role\\" = 'headquarters'::\\"text\\")))))","CREATE POLICY \\"HQ can manage all supply requests\\" ON \\"public\\".\\"supply_requests\\" USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\"\n  WHERE ((\\"profiles\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"profiles\\".\\"role\\" = 'headquarters'::\\"text\\")))))","CREATE POLICY \\"HQ can view all orders\\" ON \\"public\\".\\"orders\\" FOR SELECT USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\"\n  WHERE ((\\"profiles\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"profiles\\".\\"role\\" = 'headquarters'::\\"text\\")))))","CREATE POLICY \\"HQ can view all product sales\\" ON \\"public\\".\\"product_sales_summary\\" FOR SELECT USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\"\n  WHERE ((\\"profiles\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"profiles\\".\\"role\\" = 'headquarters'::\\"text\\")))))","CREATE POLICY \\"HQ can view all sales summary\\" ON \\"public\\".\\"daily_sales_summary\\" FOR SELECT USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\"\n  WHERE ((\\"profiles\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"profiles\\".\\"role\\" = 'headquarters'::\\"text\\")))))","CREATE POLICY \\"Only HQ can manage categories\\" ON \\"public\\".\\"categories\\" USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\"\n  WHERE ((\\"profiles\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"profiles\\".\\"role\\" = 'headquarters'::\\"text\\")))))","CREATE POLICY \\"Only HQ can manage products\\" ON \\"public\\".\\"products\\" USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\"\n  WHERE ((\\"profiles\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"profiles\\".\\"role\\" = 'headquarters'::\\"text\\")))))","CREATE POLICY \\"Only HQ can manage shipments\\" ON \\"public\\".\\"shipments\\" USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\"\n  WHERE ((\\"profiles\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"profiles\\".\\"role\\" = 'headquarters'::\\"text\\")))))","CREATE POLICY \\"Store owners can create order status history\\" ON \\"public\\".\\"order_status_history\\" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1\n   FROM (\\"public\\".\\"orders\\" \\"o\\"\n     JOIN \\"public\\".\\"stores\\" \\"s\\" ON ((\\"s\\".\\"id\\" = \\"o\\".\\"store_id\\")))\n  WHERE ((\\"o\\".\\"id\\" = \\"order_status_history\\".\\"order_id\\") AND (\\"s\\".\\"owner_id\\" = \\"auth\\".\\"uid\\"())))) OR (EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\" \\"p\\"\n  WHERE ((\\"p\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"p\\".\\"role\\" = 'headquarters'::\\"text\\"))))))","CREATE POLICY \\"Store owners can create own store\\" ON \\"public\\".\\"stores\\" FOR INSERT WITH CHECK ((\\"auth\\".\\"uid\\"() = \\"owner_id\\"))","CREATE POLICY \\"Store owners can manage own inventory transactions\\" ON \\"public\\".\\"inventory_transactions\\" USING ((EXISTS ( SELECT 1\n   FROM (\\"public\\".\\"store_products\\" \\"sp\\"\n     JOIN \\"public\\".\\"stores\\" \\"s\\" ON ((\\"s\\".\\"id\\" = \\"sp\\".\\"store_id\\")))\n  WHERE ((\\"sp\\".\\"id\\" = \\"inventory_transactions\\".\\"store_product_id\\") AND (\\"s\\".\\"owner_id\\" = \\"auth\\".\\"uid\\"())))))","CREATE POLICY \\"Store owners can manage own store products\\" ON \\"public\\".\\"store_products\\" USING ((\\"store_id\\" IN ( SELECT \\"stores\\".\\"id\\"\n   FROM \\"public\\".\\"stores\\"\n  WHERE (\\"stores\\".\\"owner_id\\" = \\"auth\\".\\"uid\\"()))))","CREATE POLICY \\"Store owners can manage own supply requests\\" ON \\"public\\".\\"supply_requests\\" USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"stores\\" \\"s\\"\n  WHERE ((\\"s\\".\\"id\\" = \\"supply_requests\\".\\"store_id\\") AND (\\"s\\".\\"owner_id\\" = \\"auth\\".\\"uid\\"())))))","CREATE POLICY \\"Store owners can manage store orders\\" ON \\"public\\".\\"orders\\" USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"stores\\" \\"s\\"\n  WHERE ((\\"s\\".\\"id\\" = \\"orders\\".\\"store_id\\") AND (\\"s\\".\\"owner_id\\" = \\"auth\\".\\"uid\\"())))))","CREATE POLICY \\"Store owners can update own store\\" ON \\"public\\".\\"stores\\" FOR UPDATE USING ((\\"owner_id\\" = \\"auth\\".\\"uid\\"()))","CREATE POLICY \\"Store owners can view own product sales\\" ON \\"public\\".\\"product_sales_summary\\" FOR SELECT USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"stores\\" \\"s\\"\n  WHERE ((\\"s\\".\\"id\\" = \\"product_sales_summary\\".\\"store_id\\") AND (\\"s\\".\\"owner_id\\" = \\"auth\\".\\"uid\\"())))))","CREATE POLICY \\"Store owners can view own sales summary\\" ON \\"public\\".\\"daily_sales_summary\\" FOR SELECT USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"stores\\" \\"s\\"\n  WHERE ((\\"s\\".\\"id\\" = \\"daily_sales_summary\\".\\"store_id\\") AND (\\"s\\".\\"owner_id\\" = \\"auth\\".\\"uid\\"())))))","CREATE POLICY \\"Store owners can view own shipments\\" ON \\"public\\".\\"shipments\\" FOR SELECT USING ((EXISTS ( SELECT 1\n   FROM (\\"public\\".\\"supply_requests\\" \\"sr\\"\n     JOIN \\"public\\".\\"stores\\" \\"s\\" ON ((\\"s\\".\\"id\\" = \\"sr\\".\\"store_id\\")))\n  WHERE ((\\"sr\\".\\"id\\" = \\"shipments\\".\\"supply_request_id\\") AND (\\"s\\".\\"owner_id\\" = \\"auth\\".\\"uid\\"())))))","CREATE POLICY \\"Store owners can view own store\\" ON \\"public\\".\\"stores\\" FOR SELECT USING (((\\"owner_id\\" = \\"auth\\".\\"uid\\"()) OR (EXISTS ( SELECT 1\n   FROM \\"public\\".\\"profiles\\"\n  WHERE ((\\"profiles\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"profiles\\".\\"role\\" = ANY (ARRAY['headquarters'::\\"text\\", 'customer'::\\"text\\"])))))))","CREATE POLICY \\"Users can insert own profile\\" ON \\"public\\".\\"profiles\\" FOR INSERT WITH CHECK ((\\"auth\\".\\"uid\\"() = \\"id\\"))","CREATE POLICY \\"Users can manage supply request items based on request access\\" ON \\"public\\".\\"supply_request_items\\" USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"supply_requests\\" \\"sr\\"\n  WHERE ((\\"sr\\".\\"id\\" = \\"supply_request_items\\".\\"supply_request_id\\") AND ((EXISTS ( SELECT 1\n           FROM \\"public\\".\\"stores\\" \\"s\\"\n          WHERE ((\\"s\\".\\"id\\" = \\"sr\\".\\"store_id\\") AND (\\"s\\".\\"owner_id\\" = \\"auth\\".\\"uid\\"())))) OR (EXISTS ( SELECT 1\n           FROM \\"public\\".\\"profiles\\" \\"p\\"\n          WHERE ((\\"p\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"p\\".\\"role\\" = 'headquarters'::\\"text\\")))))))))","CREATE POLICY \\"Users can update own notifications\\" ON \\"public\\".\\"notifications\\" FOR UPDATE USING ((\\"user_id\\" = \\"auth\\".\\"uid\\"()))","CREATE POLICY \\"Users can update own profile\\" ON \\"public\\".\\"profiles\\" FOR UPDATE USING ((\\"auth\\".\\"uid\\"() = \\"id\\"))","CREATE POLICY \\"Users can view order items based on order access\\" ON \\"public\\".\\"order_items\\" FOR SELECT USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"orders\\" \\"o\\"\n  WHERE ((\\"o\\".\\"id\\" = \\"order_items\\".\\"order_id\\") AND ((\\"o\\".\\"customer_id\\" = \\"auth\\".\\"uid\\"()) OR (EXISTS ( SELECT 1\n           FROM \\"public\\".\\"stores\\" \\"s\\"\n          WHERE ((\\"s\\".\\"id\\" = \\"o\\".\\"store_id\\") AND (\\"s\\".\\"owner_id\\" = \\"auth\\".\\"uid\\"())))) OR (EXISTS ( SELECT 1\n           FROM \\"public\\".\\"profiles\\" \\"p\\"\n          WHERE ((\\"p\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"p\\".\\"role\\" = 'headquarters'::\\"text\\")))))))))","CREATE POLICY \\"Users can view order status history based on order access\\" ON \\"public\\".\\"order_status_history\\" FOR SELECT USING ((EXISTS ( SELECT 1\n   FROM \\"public\\".\\"orders\\" \\"o\\"\n  WHERE ((\\"o\\".\\"id\\" = \\"order_status_history\\".\\"order_id\\") AND ((\\"o\\".\\"customer_id\\" = \\"auth\\".\\"uid\\"()) OR (EXISTS ( SELECT 1\n           FROM \\"public\\".\\"stores\\" \\"s\\"\n          WHERE ((\\"s\\".\\"id\\" = \\"o\\".\\"store_id\\") AND (\\"s\\".\\"owner_id\\" = \\"auth\\".\\"uid\\"())))) OR (EXISTS ( SELECT 1\n           FROM \\"public\\".\\"profiles\\" \\"p\\"\n          WHERE ((\\"p\\".\\"id\\" = \\"auth\\".\\"uid\\"()) AND (\\"p\\".\\"role\\" = 'headquarters'::\\"text\\")))))))))","CREATE POLICY \\"Users can view own notifications\\" ON \\"public\\".\\"notifications\\" FOR SELECT USING ((\\"user_id\\" = \\"auth\\".\\"uid\\"()))","CREATE POLICY \\"Users can view own profile\\" ON \\"public\\".\\"profiles\\" FOR SELECT USING ((\\"auth\\".\\"uid\\"() = \\"id\\"))","ALTER TABLE \\"public\\".\\"categories\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"daily_sales_summary\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"inventory_transactions\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"notifications\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"order_items\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"order_status_history\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"orders\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"product_sales_summary\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"products\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"profiles\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"shipments\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"store_products\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"stores\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"supply_request_items\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"supply_requests\\" ENABLE ROW LEVEL SECURITY","ALTER TABLE \\"public\\".\\"system_settings\\" ENABLE ROW LEVEL SECURITY","ALTER PUBLICATION \\"supabase_realtime\\" OWNER TO \\"postgres\\"","GRANT USAGE ON SCHEMA \\"public\\" TO \\"postgres\\"","GRANT USAGE ON SCHEMA \\"public\\" TO \\"anon\\"","GRANT USAGE ON SCHEMA \\"public\\" TO \\"authenticated\\"","GRANT USAGE ON SCHEMA \\"public\\" TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d_in\\"(\\"cstring\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d_in\\"(\\"cstring\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d_in\\"(\\"cstring\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d_in\\"(\\"cstring\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d_out\\"(\\"public\\".\\"box2d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d_out\\"(\\"public\\".\\"box2d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d_out\\"(\\"public\\".\\"box2d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d_out\\"(\\"public\\".\\"box2d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2df_in\\"(\\"cstring\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2df_in\\"(\\"cstring\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2df_in\\"(\\"cstring\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2df_in\\"(\\"cstring\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2df_out\\"(\\"public\\".\\"box2df\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2df_out\\"(\\"public\\".\\"box2df\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2df_out\\"(\\"public\\".\\"box2df\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2df_out\\"(\\"public\\".\\"box2df\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d_in\\"(\\"cstring\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d_in\\"(\\"cstring\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d_in\\"(\\"cstring\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d_in\\"(\\"cstring\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d_out\\"(\\"public\\".\\"box3d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d_out\\"(\\"public\\".\\"box3d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d_out\\"(\\"public\\".\\"box3d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d_out\\"(\\"public\\".\\"box3d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_analyze\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_analyze\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_analyze\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_analyze\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_in\\"(\\"cstring\\", \\"oid\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_in\\"(\\"cstring\\", \\"oid\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_in\\"(\\"cstring\\", \\"oid\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_in\\"(\\"cstring\\", \\"oid\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_out\\"(\\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_out\\"(\\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_out\\"(\\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_out\\"(\\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_recv\\"(\\"internal\\", \\"oid\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_recv\\"(\\"internal\\", \\"oid\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_recv\\"(\\"internal\\", \\"oid\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_recv\\"(\\"internal\\", \\"oid\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_send\\"(\\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_send\\"(\\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_send\\"(\\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_send\\"(\\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_typmod_in\\"(\\"cstring\\"[]) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_typmod_in\\"(\\"cstring\\"[]) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_typmod_in\\"(\\"cstring\\"[]) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_typmod_in\\"(\\"cstring\\"[]) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_typmod_out\\"(integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_typmod_out\\"(integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_typmod_out\\"(integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_typmod_out\\"(integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_analyze\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_analyze\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_analyze\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_analyze\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_in\\"(\\"cstring\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_in\\"(\\"cstring\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_in\\"(\\"cstring\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_in\\"(\\"cstring\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_out\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_out\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_out\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_out\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_recv\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_recv\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_recv\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_recv\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_send\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_send\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_send\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_send\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_typmod_in\\"(\\"cstring\\"[]) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_typmod_in\\"(\\"cstring\\"[]) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_typmod_in\\"(\\"cstring\\"[]) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_typmod_in\\"(\\"cstring\\"[]) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_typmod_out\\"(integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_typmod_out\\"(integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_typmod_out\\"(integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_typmod_out\\"(integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gidx_in\\"(\\"cstring\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gidx_in\\"(\\"cstring\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gidx_in\\"(\\"cstring\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gidx_in\\"(\\"cstring\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gidx_out\\"(\\"public\\".\\"gidx\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gidx_out\\"(\\"public\\".\\"gidx\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gidx_out\\"(\\"public\\".\\"gidx\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gidx_out\\"(\\"public\\".\\"gidx\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"spheroid_in\\"(\\"cstring\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"spheroid_in\\"(\\"cstring\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"spheroid_in\\"(\\"cstring\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"spheroid_in\\"(\\"cstring\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"spheroid_out\\"(\\"public\\".\\"spheroid\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"spheroid_out\\"(\\"public\\".\\"spheroid\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"spheroid_out\\"(\\"public\\".\\"spheroid\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"spheroid_out\\"(\\"public\\".\\"spheroid\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d\\"(\\"public\\".\\"box2d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d\\"(\\"public\\".\\"box2d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d\\"(\\"public\\".\\"box2d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d\\"(\\"public\\".\\"box2d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"box2d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"box2d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"box2d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"box2d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box\\"(\\"public\\".\\"box3d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box\\"(\\"public\\".\\"box3d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box\\"(\\"public\\".\\"box3d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box\\"(\\"public\\".\\"box3d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d\\"(\\"public\\".\\"box3d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d\\"(\\"public\\".\\"box3d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d\\"(\\"public\\".\\"box3d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d\\"(\\"public\\".\\"box3d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"box3d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"box3d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"box3d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"box3d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"bytea\\"(\\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"bytea\\"(\\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"bytea\\"(\\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"bytea\\"(\\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography\\"(\\"public\\".\\"geography\\", integer, boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography\\"(\\"public\\".\\"geography\\", integer, boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography\\"(\\"public\\".\\"geography\\", integer, boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography\\"(\\"public\\".\\"geography\\", integer, boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box2d\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3d\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"bytea\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"bytea\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"bytea\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"bytea\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"geometry\\", integer, boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"geometry\\", integer, boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"geometry\\", integer, boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"public\\".\\"geometry\\", integer, boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"json\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"json\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"json\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"json\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"jsonb\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"jsonb\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"jsonb\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"jsonb\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"path\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"path\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"path\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"path\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"point\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"point\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"point\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"point\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"polygon\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"polygon\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"polygon\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"polygon\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"text\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"text\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"text\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"text\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"path\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"path\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"path\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"path\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"point\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"point\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"point\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"point\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"polygon\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"polygon\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"polygon\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"polygon\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_deprecate\\"(\\"oldname\\" \\"text\\", \\"newname\\" \\"text\\", \\"version\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_deprecate\\"(\\"oldname\\" \\"text\\", \\"newname\\" \\"text\\", \\"version\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_deprecate\\"(\\"oldname\\" \\"text\\", \\"newname\\" \\"text\\", \\"version\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_deprecate\\"(\\"oldname\\" \\"text\\", \\"newname\\" \\"text\\", \\"version\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_index_extent\\"(\\"tbl\\" \\"regclass\\", \\"col\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_index_extent\\"(\\"tbl\\" \\"regclass\\", \\"col\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_index_extent\\"(\\"tbl\\" \\"regclass\\", \\"col\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_index_extent\\"(\\"tbl\\" \\"regclass\\", \\"col\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_join_selectivity\\"(\\"regclass\\", \\"text\\", \\"regclass\\", \\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_join_selectivity\\"(\\"regclass\\", \\"text\\", \\"regclass\\", \\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_join_selectivity\\"(\\"regclass\\", \\"text\\", \\"regclass\\", \\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_join_selectivity\\"(\\"regclass\\", \\"text\\", \\"regclass\\", \\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_pgsql_version\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_pgsql_version\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_pgsql_version\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_pgsql_version\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_scripts_pgsql_version\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_scripts_pgsql_version\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_scripts_pgsql_version\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_scripts_pgsql_version\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_selectivity\\"(\\"tbl\\" \\"regclass\\", \\"att_name\\" \\"text\\", \\"geom\\" \\"public\\".\\"geometry\\", \\"mode\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_selectivity\\"(\\"tbl\\" \\"regclass\\", \\"att_name\\" \\"text\\", \\"geom\\" \\"public\\".\\"geometry\\", \\"mode\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_selectivity\\"(\\"tbl\\" \\"regclass\\", \\"att_name\\" \\"text\\", \\"geom\\" \\"public\\".\\"geometry\\", \\"mode\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_selectivity\\"(\\"tbl\\" \\"regclass\\", \\"att_name\\" \\"text\\", \\"geom\\" \\"public\\".\\"geometry\\", \\"mode\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_stats\\"(\\"tbl\\" \\"regclass\\", \\"att_name\\" \\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_stats\\"(\\"tbl\\" \\"regclass\\", \\"att_name\\" \\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_stats\\"(\\"tbl\\" \\"regclass\\", \\"att_name\\" \\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_postgis_stats\\"(\\"tbl\\" \\"regclass\\", \\"att_name\\" \\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_3ddfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_3ddfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_3ddfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_3ddfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_3ddwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_3ddwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_3ddwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_3ddwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_3dintersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_3dintersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_3dintersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_3dintersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_asgml\\"(integer, \\"public\\".\\"geometry\\", integer, integer, \\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_asgml\\"(integer, \\"public\\".\\"geometry\\", integer, integer, \\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_asgml\\"(integer, \\"public\\".\\"geometry\\", integer, integer, \\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_asgml\\"(integer, \\"public\\".\\"geometry\\", integer, integer, \\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_asx3d\\"(integer, \\"public\\".\\"geometry\\", integer, integer, \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_asx3d\\"(integer, \\"public\\".\\"geometry\\", integer, integer, \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_asx3d\\"(integer, \\"public\\".\\"geometry\\", integer, integer, \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_asx3d\\"(integer, \\"public\\".\\"geometry\\", integer, integer, \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_bestsrid\\"(\\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_bestsrid\\"(\\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_bestsrid\\"(\\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_bestsrid\\"(\\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_bestsrid\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_bestsrid\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_bestsrid\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_bestsrid\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_contains\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_contains\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_contains\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_contains\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_containsproperly\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_containsproperly\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_containsproperly\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_containsproperly\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_coveredby\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_coveredby\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_coveredby\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_coveredby\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_coveredby\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_coveredby\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_coveredby\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_coveredby\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_covers\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_covers\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_covers\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_covers\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_covers\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_covers\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_covers\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_covers\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_crosses\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_crosses\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_crosses\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_crosses\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distancetree\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distancetree\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distancetree\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distancetree\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distancetree\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision, boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distancetree\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision, boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distancetree\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision, boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distancetree\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision, boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distanceuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distanceuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distanceuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distanceuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distanceuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distanceuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distanceuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distanceuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distanceuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision, boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distanceuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision, boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distanceuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision, boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_distanceuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision, boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithin\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\", \\"tolerance\\" double precision, \\"use_spheroid\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithin\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\", \\"tolerance\\" double precision, \\"use_spheroid\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithin\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\", \\"tolerance\\" double precision, \\"use_spheroid\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithin\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\", \\"tolerance\\" double precision, \\"use_spheroid\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithinuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithinuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithinuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithinuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithinuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision, boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithinuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision, boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithinuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision, boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_dwithinuncached\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\", double precision, boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_equals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_equals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_equals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_equals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_expand\\"(\\"public\\".\\"geography\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_expand\\"(\\"public\\".\\"geography\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_expand\\"(\\"public\\".\\"geography\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_expand\\"(\\"public\\".\\"geography\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_geomfromgml\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_geomfromgml\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_geomfromgml\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_geomfromgml\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_intersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_intersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_intersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_intersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_linecrossingdirection\\"(\\"line1\\" \\"public\\".\\"geometry\\", \\"line2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_linecrossingdirection\\"(\\"line1\\" \\"public\\".\\"geometry\\", \\"line2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_linecrossingdirection\\"(\\"line1\\" \\"public\\".\\"geometry\\", \\"line2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_linecrossingdirection\\"(\\"line1\\" \\"public\\".\\"geometry\\", \\"line2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_longestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_longestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_longestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_longestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_maxdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_maxdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_maxdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_maxdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_orderingequals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_orderingequals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_orderingequals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_orderingequals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_overlaps\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_overlaps\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_overlaps\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_overlaps\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_pointoutside\\"(\\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_pointoutside\\"(\\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_pointoutside\\"(\\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_pointoutside\\"(\\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_sortablehash\\"(\\"geom\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_sortablehash\\"(\\"geom\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_sortablehash\\"(\\"geom\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_sortablehash\\"(\\"geom\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_touches\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_touches\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_touches\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_touches\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_voronoi\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"clip\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"return_polygons\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_voronoi\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"clip\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"return_polygons\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_voronoi\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"clip\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"return_polygons\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_voronoi\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"clip\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"return_polygons\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_within\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_within\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_within\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"_st_within\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addauth\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addauth\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addauth\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addauth\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addgeometrycolumn\\"(\\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid\\" integer, \\"new_type\\" character varying, \\"new_dim\\" integer, \\"use_typmod\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addgeometrycolumn\\"(\\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid\\" integer, \\"new_type\\" character varying, \\"new_dim\\" integer, \\"use_typmod\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addgeometrycolumn\\"(\\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid\\" integer, \\"new_type\\" character varying, \\"new_dim\\" integer, \\"use_typmod\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addgeometrycolumn\\"(\\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid\\" integer, \\"new_type\\" character varying, \\"new_dim\\" integer, \\"use_typmod\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addgeometrycolumn\\"(\\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid\\" integer, \\"new_type\\" character varying, \\"new_dim\\" integer, \\"use_typmod\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addgeometrycolumn\\"(\\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid\\" integer, \\"new_type\\" character varying, \\"new_dim\\" integer, \\"use_typmod\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addgeometrycolumn\\"(\\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid\\" integer, \\"new_type\\" character varying, \\"new_dim\\" integer, \\"use_typmod\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addgeometrycolumn\\"(\\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid\\" integer, \\"new_type\\" character varying, \\"new_dim\\" integer, \\"use_typmod\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addgeometrycolumn\\"(\\"catalog_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid_in\\" integer, \\"new_type\\" character varying, \\"new_dim\\" integer, \\"use_typmod\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addgeometrycolumn\\"(\\"catalog_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid_in\\" integer, \\"new_type\\" character varying, \\"new_dim\\" integer, \\"use_typmod\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addgeometrycolumn\\"(\\"catalog_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid_in\\" integer, \\"new_type\\" character varying, \\"new_dim\\" integer, \\"use_typmod\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"addgeometrycolumn\\"(\\"catalog_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid_in\\" integer, \\"new_type\\" character varying, \\"new_dim\\" integer, \\"use_typmod\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3dtobox\\"(\\"public\\".\\"box3d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3dtobox\\"(\\"public\\".\\"box3d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3dtobox\\"(\\"public\\".\\"box3d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"box3dtobox\\"(\\"public\\".\\"box3d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"check_low_stock\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"check_low_stock\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"check_low_stock\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"checkauth\\"(\\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"checkauth\\"(\\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"checkauth\\"(\\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"checkauth\\"(\\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"checkauth\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"checkauth\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"checkauth\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"checkauth\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"checkauthtrigger\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"checkauthtrigger\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"checkauthtrigger\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"checkauthtrigger\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"contains_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"box2df\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"contains_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"box2df\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"contains_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"box2df\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"contains_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"box2df\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"contains_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"contains_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"contains_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"contains_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"contains_2d\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"box2df\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"contains_2d\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"box2df\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"contains_2d\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"box2df\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"contains_2d\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"box2df\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"disablelongtransactions\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"disablelongtransactions\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"disablelongtransactions\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"disablelongtransactions\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrycolumn\\"(\\"table_name\\" character varying, \\"column_name\\" character varying) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrycolumn\\"(\\"table_name\\" character varying, \\"column_name\\" character varying) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrycolumn\\"(\\"table_name\\" character varying, \\"column_name\\" character varying) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrycolumn\\"(\\"table_name\\" character varying, \\"column_name\\" character varying) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrycolumn\\"(\\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrycolumn\\"(\\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrycolumn\\"(\\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrycolumn\\"(\\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrycolumn\\"(\\"catalog_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrycolumn\\"(\\"catalog_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrycolumn\\"(\\"catalog_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrycolumn\\"(\\"catalog_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrytable\\"(\\"table_name\\" character varying) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrytable\\"(\\"table_name\\" character varying) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrytable\\"(\\"table_name\\" character varying) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrytable\\"(\\"table_name\\" character varying) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrytable\\"(\\"schema_name\\" character varying, \\"table_name\\" character varying) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrytable\\"(\\"schema_name\\" character varying, \\"table_name\\" character varying) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrytable\\"(\\"schema_name\\" character varying, \\"table_name\\" character varying) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrytable\\"(\\"schema_name\\" character varying, \\"table_name\\" character varying) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrytable\\"(\\"catalog_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrytable\\"(\\"catalog_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrytable\\"(\\"catalog_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"dropgeometrytable\\"(\\"catalog_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"enablelongtransactions\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"enablelongtransactions\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"enablelongtransactions\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"enablelongtransactions\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"equals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"equals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"equals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"equals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"find_srid\\"(character varying, character varying, character varying) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"find_srid\\"(character varying, character varying, character varying) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"find_srid\\"(character varying, character varying, character varying) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"find_srid\\"(character varying, character varying, character varying) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"generate_order_number\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"generate_order_number\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"generate_order_number\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"generate_shipment_number\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"generate_shipment_number\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"generate_shipment_number\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"generate_supply_request_number\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"generate_supply_request_number\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"generate_supply_request_number\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geog_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geog_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geog_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geog_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_cmp\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_cmp\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_cmp\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_cmp\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_distance_knn\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_distance_knn\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_distance_knn\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_distance_knn\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_eq\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_eq\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_eq\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_eq\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_ge\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_ge\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_ge\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_ge\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_compress\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_compress\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_compress\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_compress\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_consistent\\"(\\"internal\\", \\"public\\".\\"geography\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_consistent\\"(\\"internal\\", \\"public\\".\\"geography\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_consistent\\"(\\"internal\\", \\"public\\".\\"geography\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_consistent\\"(\\"internal\\", \\"public\\".\\"geography\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_decompress\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_decompress\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_decompress\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_decompress\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_distance\\"(\\"internal\\", \\"public\\".\\"geography\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_distance\\"(\\"internal\\", \\"public\\".\\"geography\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_distance\\"(\\"internal\\", \\"public\\".\\"geography\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_distance\\"(\\"internal\\", \\"public\\".\\"geography\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_penalty\\"(\\"internal\\", \\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_penalty\\"(\\"internal\\", \\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_penalty\\"(\\"internal\\", \\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_penalty\\"(\\"internal\\", \\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_picksplit\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_picksplit\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_picksplit\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_picksplit\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_same\\"(\\"public\\".\\"box2d\\", \\"public\\".\\"box2d\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_same\\"(\\"public\\".\\"box2d\\", \\"public\\".\\"box2d\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_same\\"(\\"public\\".\\"box2d\\", \\"public\\".\\"box2d\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_same\\"(\\"public\\".\\"box2d\\", \\"public\\".\\"box2d\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_union\\"(\\"bytea\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_union\\"(\\"bytea\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_union\\"(\\"bytea\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gist_union\\"(\\"bytea\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gt\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gt\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gt\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_gt\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_le\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_le\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_le\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_le\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_lt\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_lt\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_lt\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_lt\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_overlaps\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_overlaps\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_overlaps\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_overlaps\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_choose_nd\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_choose_nd\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_choose_nd\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_choose_nd\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_compress_nd\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_compress_nd\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_compress_nd\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_compress_nd\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_config_nd\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_config_nd\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_config_nd\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_config_nd\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_inner_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_inner_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_inner_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_inner_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_leaf_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_leaf_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_leaf_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_leaf_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_picksplit_nd\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_picksplit_nd\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_picksplit_nd\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geography_spgist_picksplit_nd\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geom2d_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geom2d_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geom2d_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geom2d_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geom3d_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geom3d_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geom3d_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geom3d_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geom4d_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geom4d_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geom4d_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geom4d_brin_inclusion_add_value\\"(\\"internal\\", \\"internal\\", \\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_above\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_above\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_above\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_above\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_below\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_below\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_below\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_below\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_cmp\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_cmp\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_cmp\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_cmp\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contained_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contained_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contained_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contained_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contains\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contains\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contains\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contains\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contains_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contains_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contains_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contains_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contains_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contains_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contains_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_contains_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_box\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_box\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_box\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_box\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_centroid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_centroid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_centroid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_centroid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_centroid_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_centroid_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_centroid_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_centroid_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_cpa\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_cpa\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_cpa\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_distance_cpa\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_eq\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_eq\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_eq\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_eq\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_ge\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_ge\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_ge\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_ge\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_compress_2d\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_compress_2d\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_compress_2d\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_compress_2d\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_compress_nd\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_compress_nd\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_compress_nd\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_compress_nd\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_consistent_2d\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_consistent_2d\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_consistent_2d\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_consistent_2d\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_consistent_nd\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_consistent_nd\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_consistent_nd\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_consistent_nd\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_decompress_2d\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_decompress_2d\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_decompress_2d\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_decompress_2d\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_decompress_nd\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_decompress_nd\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_decompress_nd\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_decompress_nd\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_distance_2d\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_distance_2d\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_distance_2d\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_distance_2d\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_distance_nd\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_distance_nd\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_distance_nd\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_distance_nd\\"(\\"internal\\", \\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_penalty_2d\\"(\\"internal\\", \\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_penalty_2d\\"(\\"internal\\", \\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_penalty_2d\\"(\\"internal\\", \\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_penalty_2d\\"(\\"internal\\", \\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_penalty_nd\\"(\\"internal\\", \\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_penalty_nd\\"(\\"internal\\", \\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_penalty_nd\\"(\\"internal\\", \\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_penalty_nd\\"(\\"internal\\", \\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_picksplit_2d\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_picksplit_2d\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_picksplit_2d\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_picksplit_2d\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_picksplit_nd\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_picksplit_nd\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_picksplit_nd\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_picksplit_nd\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_same_2d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_same_2d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_same_2d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_same_2d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_same_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_same_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_same_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_same_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_sortsupport_2d\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_sortsupport_2d\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_sortsupport_2d\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_sortsupport_2d\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_union_2d\\"(\\"bytea\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_union_2d\\"(\\"bytea\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_union_2d\\"(\\"bytea\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_union_2d\\"(\\"bytea\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_union_nd\\"(\\"bytea\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_union_nd\\"(\\"bytea\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_union_nd\\"(\\"bytea\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gist_union_nd\\"(\\"bytea\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gt\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gt\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gt\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_gt\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_hash\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_hash\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_hash\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_hash\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_le\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_le\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_le\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_le\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_left\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_left\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_left\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_left\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_lt\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_lt\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_lt\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_lt\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overabove\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overabove\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overabove\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overabove\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overbelow\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overbelow\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overbelow\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overbelow\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overlaps\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overlaps\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overlaps\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overlaps\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overlaps_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overlaps_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overlaps_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overlaps_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overlaps_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overlaps_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overlaps_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overlaps_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overleft\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overleft\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overleft\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overleft\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overright\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overright\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overright\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_overright\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_right\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_right\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_right\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_right\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_same\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_same\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_same\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_same\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_same_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_same_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_same_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_same_3d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_same_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_same_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_same_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_same_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_sortsupport\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_sortsupport\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_sortsupport\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_sortsupport\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_choose_2d\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_choose_2d\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_choose_2d\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_choose_2d\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_choose_3d\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_choose_3d\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_choose_3d\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_choose_3d\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_choose_nd\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_choose_nd\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_choose_nd\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_choose_nd\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_compress_2d\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_compress_2d\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_compress_2d\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_compress_2d\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_compress_3d\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_compress_3d\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_compress_3d\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_compress_3d\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_compress_nd\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_compress_nd\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_compress_nd\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_compress_nd\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_config_2d\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_config_2d\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_config_2d\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_config_2d\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_config_3d\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_config_3d\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_config_3d\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_config_3d\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_config_nd\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_config_nd\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_config_nd\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_config_nd\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_inner_consistent_2d\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_inner_consistent_2d\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_inner_consistent_2d\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_inner_consistent_2d\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_inner_consistent_3d\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_inner_consistent_3d\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_inner_consistent_3d\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_inner_consistent_3d\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_inner_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_inner_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_inner_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_inner_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_leaf_consistent_2d\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_leaf_consistent_2d\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_leaf_consistent_2d\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_leaf_consistent_2d\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_leaf_consistent_3d\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_leaf_consistent_3d\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_leaf_consistent_3d\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_leaf_consistent_3d\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_leaf_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_leaf_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_leaf_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_leaf_consistent_nd\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_picksplit_2d\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_picksplit_2d\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_picksplit_2d\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_picksplit_2d\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_picksplit_3d\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_picksplit_3d\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_picksplit_3d\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_picksplit_3d\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_picksplit_nd\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_picksplit_nd\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_picksplit_nd\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_spgist_picksplit_nd\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_within\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_within\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_within\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_within\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_within_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_within_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_within_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometry_within_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometrytype\\"(\\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometrytype\\"(\\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometrytype\\"(\\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometrytype\\"(\\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometrytype\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometrytype\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometrytype\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geometrytype\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geomfromewkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geomfromewkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geomfromewkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geomfromewkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geomfromewkt\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geomfromewkt\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geomfromewkt\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"geomfromewkt\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"get_product_rankings\\"(\\"start_date\\" \\"date\\", \\"end_date\\" \\"date\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"get_product_rankings\\"(\\"start_date\\" \\"date\\", \\"end_date\\" \\"date\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"get_product_rankings\\"(\\"start_date\\" \\"date\\", \\"end_date\\" \\"date\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"get_proj4_from_srid\\"(integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"get_proj4_from_srid\\"(integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"get_proj4_from_srid\\"(integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"get_proj4_from_srid\\"(integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"get_sales_summary\\"(\\"start_date\\" \\"date\\", \\"end_date\\" \\"date\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"get_sales_summary\\"(\\"start_date\\" \\"date\\", \\"end_date\\" \\"date\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"get_sales_summary\\"(\\"start_date\\" \\"date\\", \\"end_date\\" \\"date\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"get_store_rankings\\"(\\"start_date\\" \\"date\\", \\"end_date\\" \\"date\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"get_store_rankings\\"(\\"start_date\\" \\"date\\", \\"end_date\\" \\"date\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"get_store_rankings\\"(\\"start_date\\" \\"date\\", \\"end_date\\" \\"date\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gettransactionid\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gettransactionid\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gettransactionid\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gettransactionid\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_joinsel_2d\\"(\\"internal\\", \\"oid\\", \\"internal\\", smallint) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_joinsel_2d\\"(\\"internal\\", \\"oid\\", \\"internal\\", smallint) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_joinsel_2d\\"(\\"internal\\", \\"oid\\", \\"internal\\", smallint) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_joinsel_2d\\"(\\"internal\\", \\"oid\\", \\"internal\\", smallint) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_joinsel_nd\\"(\\"internal\\", \\"oid\\", \\"internal\\", smallint) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_joinsel_nd\\"(\\"internal\\", \\"oid\\", \\"internal\\", smallint) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_joinsel_nd\\"(\\"internal\\", \\"oid\\", \\"internal\\", smallint) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_joinsel_nd\\"(\\"internal\\", \\"oid\\", \\"internal\\", smallint) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_sel_2d\\"(\\"internal\\", \\"oid\\", \\"internal\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_sel_2d\\"(\\"internal\\", \\"oid\\", \\"internal\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_sel_2d\\"(\\"internal\\", \\"oid\\", \\"internal\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_sel_2d\\"(\\"internal\\", \\"oid\\", \\"internal\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_sel_nd\\"(\\"internal\\", \\"oid\\", \\"internal\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_sel_nd\\"(\\"internal\\", \\"oid\\", \\"internal\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_sel_nd\\"(\\"internal\\", \\"oid\\", \\"internal\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"gserialized_gist_sel_nd\\"(\\"internal\\", \\"oid\\", \\"internal\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"handle_order_completion\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"handle_order_completion\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"handle_order_completion\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"handle_shipment_delivery\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"handle_shipment_delivery\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"handle_shipment_delivery\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"initialize_store_products\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"initialize_store_products\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"initialize_store_products\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"is_contained_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"box2df\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"is_contained_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"box2df\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"is_contained_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"box2df\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"is_contained_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"box2df\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"is_contained_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"is_contained_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"is_contained_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"is_contained_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"is_contained_2d\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"box2df\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"is_contained_2d\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"box2df\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"is_contained_2d\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"box2df\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"is_contained_2d\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"box2df\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\", timestamp without time zone) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\", timestamp without time zone) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\", timestamp without time zone) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\", timestamp without time zone) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\", \\"text\\", timestamp without time zone) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\", \\"text\\", timestamp without time zone) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\", \\"text\\", timestamp without time zone) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"lockrow\\"(\\"text\\", \\"text\\", \\"text\\", \\"text\\", timestamp without time zone) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"log_order_status_change\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"log_order_status_change\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"log_order_status_change\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"longtransactionsenabled\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"longtransactionsenabled\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"longtransactionsenabled\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"longtransactionsenabled\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"box2df\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"box2df\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"box2df\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"box2df\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_2d\\"(\\"public\\".\\"box2df\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_2d\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"box2df\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_2d\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"box2df\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_2d\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"box2df\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_2d\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"box2df\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_geog\\"(\\"public\\".\\"geography\\", \\"public\\".\\"gidx\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_geog\\"(\\"public\\".\\"geography\\", \\"public\\".\\"gidx\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_geog\\"(\\"public\\".\\"geography\\", \\"public\\".\\"gidx\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_geog\\"(\\"public\\".\\"geography\\", \\"public\\".\\"gidx\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_geog\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_geog\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_geog\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_geog\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_geog\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"gidx\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_geog\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"gidx\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_geog\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"gidx\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_geog\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"gidx\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"gidx\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"gidx\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"gidx\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_nd\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"gidx\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_nd\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_nd\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_nd\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_nd\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_nd\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"gidx\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_nd\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"gidx\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_nd\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"gidx\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"overlaps_nd\\"(\\"public\\".\\"gidx\\", \\"public\\".\\"gidx\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_finalfn\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_finalfn\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_finalfn\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_finalfn\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\", boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\", boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\", boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\", boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\", boolean, \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\", boolean, \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\", boolean, \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asflatgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\", boolean, \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asgeobuf_finalfn\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asgeobuf_finalfn\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asgeobuf_finalfn\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asgeobuf_finalfn\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asgeobuf_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_combinefn\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_combinefn\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_combinefn\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_combinefn\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_deserialfn\\"(\\"bytea\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_deserialfn\\"(\\"bytea\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_deserialfn\\"(\\"bytea\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_deserialfn\\"(\\"bytea\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_finalfn\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_finalfn\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_finalfn\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_finalfn\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_serialfn\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_serialfn\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_serialfn\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_serialfn\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\", integer, \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\", integer, \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\", integer, \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\", integer, \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\", integer, \\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\", integer, \\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\", integer, \\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_asmvt_transfn\\"(\\"internal\\", \\"anyelement\\", \\"text\\", integer, \\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_accum_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_accum_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_accum_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_accum_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_accum_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_accum_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_accum_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_accum_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_accum_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\", double precision, integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_accum_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\", double precision, integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_accum_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\", double precision, integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_accum_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\", double precision, integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_clusterintersecting_finalfn\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_clusterintersecting_finalfn\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_clusterintersecting_finalfn\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_clusterintersecting_finalfn\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_clusterwithin_finalfn\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_clusterwithin_finalfn\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_clusterwithin_finalfn\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_clusterwithin_finalfn\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_collect_finalfn\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_collect_finalfn\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_collect_finalfn\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_collect_finalfn\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_makeline_finalfn\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_makeline_finalfn\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_makeline_finalfn\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_makeline_finalfn\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_polygonize_finalfn\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_polygonize_finalfn\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_polygonize_finalfn\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_polygonize_finalfn\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_combinefn\\"(\\"internal\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_combinefn\\"(\\"internal\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_combinefn\\"(\\"internal\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_combinefn\\"(\\"internal\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_deserialfn\\"(\\"bytea\\", \\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_deserialfn\\"(\\"bytea\\", \\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_deserialfn\\"(\\"bytea\\", \\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_deserialfn\\"(\\"bytea\\", \\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_finalfn\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_finalfn\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_finalfn\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_finalfn\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_serialfn\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_serialfn\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_serialfn\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_serialfn\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"pgis_geometry_union_parallel_transfn\\"(\\"internal\\", \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"populate_geometry_columns\\"(\\"use_typmod\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"populate_geometry_columns\\"(\\"use_typmod\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"populate_geometry_columns\\"(\\"use_typmod\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"populate_geometry_columns\\"(\\"use_typmod\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"populate_geometry_columns\\"(\\"tbl_oid\\" \\"oid\\", \\"use_typmod\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"populate_geometry_columns\\"(\\"tbl_oid\\" \\"oid\\", \\"use_typmod\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"populate_geometry_columns\\"(\\"tbl_oid\\" \\"oid\\", \\"use_typmod\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"populate_geometry_columns\\"(\\"tbl_oid\\" \\"oid\\", \\"use_typmod\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_addbbox\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_addbbox\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_addbbox\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_addbbox\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_cache_bbox\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_cache_bbox\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_cache_bbox\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_cache_bbox\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_constraint_dims\\"(\\"geomschema\\" \\"text\\", \\"geomtable\\" \\"text\\", \\"geomcolumn\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_constraint_dims\\"(\\"geomschema\\" \\"text\\", \\"geomtable\\" \\"text\\", \\"geomcolumn\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_constraint_dims\\"(\\"geomschema\\" \\"text\\", \\"geomtable\\" \\"text\\", \\"geomcolumn\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_constraint_dims\\"(\\"geomschema\\" \\"text\\", \\"geomtable\\" \\"text\\", \\"geomcolumn\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_constraint_srid\\"(\\"geomschema\\" \\"text\\", \\"geomtable\\" \\"text\\", \\"geomcolumn\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_constraint_srid\\"(\\"geomschema\\" \\"text\\", \\"geomtable\\" \\"text\\", \\"geomcolumn\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_constraint_srid\\"(\\"geomschema\\" \\"text\\", \\"geomtable\\" \\"text\\", \\"geomcolumn\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_constraint_srid\\"(\\"geomschema\\" \\"text\\", \\"geomtable\\" \\"text\\", \\"geomcolumn\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_constraint_type\\"(\\"geomschema\\" \\"text\\", \\"geomtable\\" \\"text\\", \\"geomcolumn\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_constraint_type\\"(\\"geomschema\\" \\"text\\", \\"geomtable\\" \\"text\\", \\"geomcolumn\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_constraint_type\\"(\\"geomschema\\" \\"text\\", \\"geomtable\\" \\"text\\", \\"geomcolumn\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_constraint_type\\"(\\"geomschema\\" \\"text\\", \\"geomtable\\" \\"text\\", \\"geomcolumn\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_dropbbox\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_dropbbox\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_dropbbox\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_dropbbox\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_extensions_upgrade\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_extensions_upgrade\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_extensions_upgrade\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_extensions_upgrade\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_full_version\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_full_version\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_full_version\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_full_version\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_geos_noop\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_geos_noop\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_geos_noop\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_geos_noop\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_geos_version\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_geos_version\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_geos_version\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_geos_version\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_getbbox\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_getbbox\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_getbbox\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_getbbox\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_hasbbox\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_hasbbox\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_hasbbox\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_hasbbox\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_index_supportfn\\"(\\"internal\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_index_supportfn\\"(\\"internal\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_index_supportfn\\"(\\"internal\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_index_supportfn\\"(\\"internal\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_lib_build_date\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_lib_build_date\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_lib_build_date\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_lib_build_date\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_lib_revision\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_lib_revision\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_lib_revision\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_lib_revision\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_lib_version\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_lib_version\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_lib_version\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_lib_version\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_libjson_version\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_libjson_version\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_libjson_version\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_libjson_version\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_liblwgeom_version\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_liblwgeom_version\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_liblwgeom_version\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_liblwgeom_version\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_libprotobuf_version\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_libprotobuf_version\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_libprotobuf_version\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_libprotobuf_version\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_libxml_version\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_libxml_version\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_libxml_version\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_libxml_version\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_noop\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_noop\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_noop\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_noop\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_proj_version\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_proj_version\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_proj_version\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_proj_version\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_scripts_build_date\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_scripts_build_date\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_scripts_build_date\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_scripts_build_date\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_scripts_installed\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_scripts_installed\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_scripts_installed\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_scripts_installed\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_scripts_released\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_scripts_released\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_scripts_released\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_scripts_released\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_svn_version\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_svn_version\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_svn_version\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_svn_version\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_transform_geometry\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"text\\", \\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_transform_geometry\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"text\\", \\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_transform_geometry\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"text\\", \\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_transform_geometry\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"text\\", \\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_type_name\\"(\\"geomname\\" character varying, \\"coord_dimension\\" integer, \\"use_new_name\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_type_name\\"(\\"geomname\\" character varying, \\"coord_dimension\\" integer, \\"use_new_name\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_type_name\\"(\\"geomname\\" character varying, \\"coord_dimension\\" integer, \\"use_new_name\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_type_name\\"(\\"geomname\\" character varying, \\"coord_dimension\\" integer, \\"use_new_name\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_typmod_dims\\"(integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_typmod_dims\\"(integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_typmod_dims\\"(integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_typmod_dims\\"(integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_typmod_srid\\"(integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_typmod_srid\\"(integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_typmod_srid\\"(integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_typmod_srid\\"(integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_typmod_type\\"(integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_typmod_type\\"(integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_typmod_type\\"(integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_typmod_type\\"(integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_version\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_version\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_version\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_version\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_wagyu_version\\"() TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_wagyu_version\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_wagyu_version\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"postgis_wagyu_version\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"prevent_duplicate_orders\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"prevent_duplicate_orders\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"prevent_duplicate_orders\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dclosestpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dclosestpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dclosestpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dclosestpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3ddfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3ddfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3ddfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3ddfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3ddistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3ddistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3ddistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3ddistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3ddwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3ddwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3ddwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3ddwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dintersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dintersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dintersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dintersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dlength\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dlength\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dlength\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dlength\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dlineinterpolatepoint\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dlineinterpolatepoint\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dlineinterpolatepoint\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dlineinterpolatepoint\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dlongestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dlongestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dlongestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dlongestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dmakebox\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dmakebox\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dmakebox\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dmakebox\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dmaxdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dmaxdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dmaxdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dmaxdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dperimeter\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dperimeter\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dperimeter\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dperimeter\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dshortestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dshortestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dshortestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dshortestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_addmeasure\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_addmeasure\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_addmeasure\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_addmeasure\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_addpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_addpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_addpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_addpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_addpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_addpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_addpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_addpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_affine\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision, double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_affine\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision, double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_affine\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision, double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_affine\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision, double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_affine\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_affine\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_affine\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_affine\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_angle\\"(\\"line1\\" \\"public\\".\\"geometry\\", \\"line2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_angle\\"(\\"line1\\" \\"public\\".\\"geometry\\", \\"line2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_angle\\"(\\"line1\\" \\"public\\".\\"geometry\\", \\"line2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_angle\\"(\\"line1\\" \\"public\\".\\"geometry\\", \\"line2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_angle\\"(\\"pt1\\" \\"public\\".\\"geometry\\", \\"pt2\\" \\"public\\".\\"geometry\\", \\"pt3\\" \\"public\\".\\"geometry\\", \\"pt4\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_angle\\"(\\"pt1\\" \\"public\\".\\"geometry\\", \\"pt2\\" \\"public\\".\\"geometry\\", \\"pt3\\" \\"public\\".\\"geometry\\", \\"pt4\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_angle\\"(\\"pt1\\" \\"public\\".\\"geometry\\", \\"pt2\\" \\"public\\".\\"geometry\\", \\"pt3\\" \\"public\\".\\"geometry\\", \\"pt4\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_angle\\"(\\"pt1\\" \\"public\\".\\"geometry\\", \\"pt2\\" \\"public\\".\\"geometry\\", \\"pt3\\" \\"public\\".\\"geometry\\", \\"pt4\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area2d\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area2d\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area2d\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_area2d\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geography\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geography\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geography\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geography\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geometry\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geometry\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geometry\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asbinary\\"(\\"public\\".\\"geometry\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asencodedpolyline\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"nprecision\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asencodedpolyline\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"nprecision\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asencodedpolyline\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"nprecision\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asencodedpolyline\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"nprecision\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkb\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkb\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkb\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkb\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkb\\"(\\"public\\".\\"geometry\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkb\\"(\\"public\\".\\"geometry\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkb\\"(\\"public\\".\\"geometry\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkb\\"(\\"public\\".\\"geometry\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geography\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geography\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geography\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geography\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asewkt\\"(\\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"r\\" \\"record\\", \\"geom_column\\" \\"text\\", \\"maxdecimaldigits\\" integer, \\"pretty_bool\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"r\\" \\"record\\", \\"geom_column\\" \\"text\\", \\"maxdecimaldigits\\" integer, \\"pretty_bool\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"r\\" \\"record\\", \\"geom_column\\" \\"text\\", \\"maxdecimaldigits\\" integer, \\"pretty_bool\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeojson\\"(\\"r\\" \\"record\\", \\"geom_column\\" \\"text\\", \\"maxdecimaldigits\\" integer, \\"pretty_bool\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer, \\"nprefix\\" \\"text\\", \\"id\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer, \\"nprefix\\" \\"text\\", \\"id\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer, \\"nprefix\\" \\"text\\", \\"id\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer, \\"nprefix\\" \\"text\\", \\"id\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"version\\" integer, \\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer, \\"nprefix\\" \\"text\\", \\"id\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"version\\" integer, \\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer, \\"nprefix\\" \\"text\\", \\"id\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"version\\" integer, \\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer, \\"nprefix\\" \\"text\\", \\"id\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"version\\" integer, \\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer, \\"nprefix\\" \\"text\\", \\"id\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"version\\" integer, \\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer, \\"nprefix\\" \\"text\\", \\"id\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"version\\" integer, \\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer, \\"nprefix\\" \\"text\\", \\"id\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"version\\" integer, \\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer, \\"nprefix\\" \\"text\\", \\"id\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgml\\"(\\"version\\" integer, \\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer, \\"nprefix\\" \\"text\\", \\"id\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ashexewkb\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ashexewkb\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ashexewkb\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ashexewkb\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ashexewkb\\"(\\"public\\".\\"geometry\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ashexewkb\\"(\\"public\\".\\"geometry\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ashexewkb\\"(\\"public\\".\\"geometry\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ashexewkb\\"(\\"public\\".\\"geometry\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_askml\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_askml\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_askml\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_askml\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_askml\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"nprefix\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_askml\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"nprefix\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_askml\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"nprefix\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_askml\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxdecimaldigits\\" integer, \\"nprefix\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_askml\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"nprefix\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_askml\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"nprefix\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_askml\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"nprefix\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_askml\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"nprefix\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_aslatlontext\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"tmpl\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_aslatlontext\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"tmpl\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_aslatlontext\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"tmpl\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_aslatlontext\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"tmpl\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmarc21\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"format\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmarc21\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"format\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmarc21\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"format\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmarc21\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"format\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvtgeom\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"bounds\\" \\"public\\".\\"box2d\\", \\"extent\\" integer, \\"buffer\\" integer, \\"clip_geom\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvtgeom\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"bounds\\" \\"public\\".\\"box2d\\", \\"extent\\" integer, \\"buffer\\" integer, \\"clip_geom\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvtgeom\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"bounds\\" \\"public\\".\\"box2d\\", \\"extent\\" integer, \\"buffer\\" integer, \\"clip_geom\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvtgeom\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"bounds\\" \\"public\\".\\"box2d\\", \\"extent\\" integer, \\"buffer\\" integer, \\"clip_geom\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_assvg\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_assvg\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_assvg\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_assvg\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_assvg\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"rel\\" integer, \\"maxdecimaldigits\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_assvg\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"rel\\" integer, \\"maxdecimaldigits\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_assvg\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"rel\\" integer, \\"maxdecimaldigits\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_assvg\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"rel\\" integer, \\"maxdecimaldigits\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_assvg\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"rel\\" integer, \\"maxdecimaldigits\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_assvg\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"rel\\" integer, \\"maxdecimaldigits\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_assvg\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"rel\\" integer, \\"maxdecimaldigits\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_assvg\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"rel\\" integer, \\"maxdecimaldigits\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geography\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geography\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geography\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geography\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astext\\"(\\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astwkb\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"prec\\" integer, \\"prec_z\\" integer, \\"prec_m\\" integer, \\"with_sizes\\" boolean, \\"with_boxes\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astwkb\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"prec\\" integer, \\"prec_z\\" integer, \\"prec_m\\" integer, \\"with_sizes\\" boolean, \\"with_boxes\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astwkb\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"prec\\" integer, \\"prec_z\\" integer, \\"prec_m\\" integer, \\"with_sizes\\" boolean, \\"with_boxes\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astwkb\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"prec\\" integer, \\"prec_z\\" integer, \\"prec_m\\" integer, \\"with_sizes\\" boolean, \\"with_boxes\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astwkb\\"(\\"geom\\" \\"public\\".\\"geometry\\"[], \\"ids\\" bigint[], \\"prec\\" integer, \\"prec_z\\" integer, \\"prec_m\\" integer, \\"with_sizes\\" boolean, \\"with_boxes\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astwkb\\"(\\"geom\\" \\"public\\".\\"geometry\\"[], \\"ids\\" bigint[], \\"prec\\" integer, \\"prec_z\\" integer, \\"prec_m\\" integer, \\"with_sizes\\" boolean, \\"with_boxes\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astwkb\\"(\\"geom\\" \\"public\\".\\"geometry\\"[], \\"ids\\" bigint[], \\"prec\\" integer, \\"prec_z\\" integer, \\"prec_m\\" integer, \\"with_sizes\\" boolean, \\"with_boxes\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_astwkb\\"(\\"geom\\" \\"public\\".\\"geometry\\"[], \\"ids\\" bigint[], \\"prec\\" integer, \\"prec_z\\" integer, \\"prec_m\\" integer, \\"with_sizes\\" boolean, \\"with_boxes\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asx3d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asx3d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asx3d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asx3d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxdecimaldigits\\" integer, \\"options\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_azimuth\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_azimuth\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_azimuth\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_azimuth\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_azimuth\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_azimuth\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_azimuth\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_azimuth\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_bdmpolyfromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_bdmpolyfromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_bdmpolyfromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_bdmpolyfromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_bdpolyfromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_bdpolyfromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_bdpolyfromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_bdpolyfromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_boundary\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_boundary\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_boundary\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_boundary\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_boundingdiagonal\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"fits\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_boundingdiagonal\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"fits\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_boundingdiagonal\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"fits\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_boundingdiagonal\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"fits\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_box2dfromgeohash\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_box2dfromgeohash\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_box2dfromgeohash\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_box2dfromgeohash\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"text\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"text\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"text\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"text\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"public\\".\\"geography\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"public\\".\\"geography\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"public\\".\\"geography\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"public\\".\\"geography\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"text\\", double precision, integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"text\\", double precision, integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"text\\", double precision, integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"text\\", double precision, integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"text\\", double precision, \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"text\\", double precision, \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"text\\", double precision, \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"text\\", double precision, \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"public\\".\\"geography\\", double precision, integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"public\\".\\"geography\\", double precision, integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"public\\".\\"geography\\", double precision, integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"public\\".\\"geography\\", double precision, integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"public\\".\\"geography\\", double precision, \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"public\\".\\"geography\\", double precision, \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"public\\".\\"geography\\", double precision, \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"public\\".\\"geography\\", double precision, \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"radius\\" double precision, \\"quadsegs\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"radius\\" double precision, \\"quadsegs\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"radius\\" double precision, \\"quadsegs\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"radius\\" double precision, \\"quadsegs\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"radius\\" double precision, \\"options\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"radius\\" double precision, \\"options\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"radius\\" double precision, \\"options\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buffer\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"radius\\" double precision, \\"options\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buildarea\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buildarea\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buildarea\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_buildarea\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_centroid\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_centroid\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_centroid\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_centroid\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_centroid\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_centroid\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_centroid\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_centroid\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_centroid\\"(\\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_centroid\\"(\\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_centroid\\"(\\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_centroid\\"(\\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_chaikinsmoothing\\"(\\"public\\".\\"geometry\\", integer, boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_chaikinsmoothing\\"(\\"public\\".\\"geometry\\", integer, boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_chaikinsmoothing\\"(\\"public\\".\\"geometry\\", integer, boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_chaikinsmoothing\\"(\\"public\\".\\"geometry\\", integer, boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_cleangeometry\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_cleangeometry\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_cleangeometry\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_cleangeometry\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clipbybox2d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"box\\" \\"public\\".\\"box2d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clipbybox2d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"box\\" \\"public\\".\\"box2d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clipbybox2d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"box\\" \\"public\\".\\"box2d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clipbybox2d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"box\\" \\"public\\".\\"box2d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_closestpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_closestpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_closestpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_closestpoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_closestpointofapproach\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_closestpointofapproach\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_closestpointofapproach\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_closestpointofapproach\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterdbscan\\"(\\"public\\".\\"geometry\\", \\"eps\\" double precision, \\"minpoints\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterdbscan\\"(\\"public\\".\\"geometry\\", \\"eps\\" double precision, \\"minpoints\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterdbscan\\"(\\"public\\".\\"geometry\\", \\"eps\\" double precision, \\"minpoints\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterdbscan\\"(\\"public\\".\\"geometry\\", \\"eps\\" double precision, \\"minpoints\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterintersecting\\"(\\"public\\".\\"geometry\\"[]) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterintersecting\\"(\\"public\\".\\"geometry\\"[]) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterintersecting\\"(\\"public\\".\\"geometry\\"[]) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterintersecting\\"(\\"public\\".\\"geometry\\"[]) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterkmeans\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"k\\" integer, \\"max_radius\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterkmeans\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"k\\" integer, \\"max_radius\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterkmeans\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"k\\" integer, \\"max_radius\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterkmeans\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"k\\" integer, \\"max_radius\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterwithin\\"(\\"public\\".\\"geometry\\"[], double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterwithin\\"(\\"public\\".\\"geometry\\"[], double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterwithin\\"(\\"public\\".\\"geometry\\"[], double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterwithin\\"(\\"public\\".\\"geometry\\"[], double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collect\\"(\\"public\\".\\"geometry\\"[]) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collect\\"(\\"public\\".\\"geometry\\"[]) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collect\\"(\\"public\\".\\"geometry\\"[]) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collect\\"(\\"public\\".\\"geometry\\"[]) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collect\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collect\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collect\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collect\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collectionextract\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collectionextract\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collectionextract\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collectionextract\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collectionextract\\"(\\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collectionextract\\"(\\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collectionextract\\"(\\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collectionextract\\"(\\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collectionhomogenize\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collectionhomogenize\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collectionhomogenize\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collectionhomogenize\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_combinebbox\\"(\\"public\\".\\"box2d\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_combinebbox\\"(\\"public\\".\\"box2d\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_combinebbox\\"(\\"public\\".\\"box2d\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_combinebbox\\"(\\"public\\".\\"box2d\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_combinebbox\\"(\\"public\\".\\"box3d\\", \\"public\\".\\"box3d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_combinebbox\\"(\\"public\\".\\"box3d\\", \\"public\\".\\"box3d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_combinebbox\\"(\\"public\\".\\"box3d\\", \\"public\\".\\"box3d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_combinebbox\\"(\\"public\\".\\"box3d\\", \\"public\\".\\"box3d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_combinebbox\\"(\\"public\\".\\"box3d\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_combinebbox\\"(\\"public\\".\\"box3d\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_combinebbox\\"(\\"public\\".\\"box3d\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_combinebbox\\"(\\"public\\".\\"box3d\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_concavehull\\"(\\"param_geom\\" \\"public\\".\\"geometry\\", \\"param_pctconvex\\" double precision, \\"param_allow_holes\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_concavehull\\"(\\"param_geom\\" \\"public\\".\\"geometry\\", \\"param_pctconvex\\" double precision, \\"param_allow_holes\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_concavehull\\"(\\"param_geom\\" \\"public\\".\\"geometry\\", \\"param_pctconvex\\" double precision, \\"param_allow_holes\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_concavehull\\"(\\"param_geom\\" \\"public\\".\\"geometry\\", \\"param_pctconvex\\" double precision, \\"param_allow_holes\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_contains\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_contains\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_contains\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_contains\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_containsproperly\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_containsproperly\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_containsproperly\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_containsproperly\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_convexhull\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_convexhull\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_convexhull\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_convexhull\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coorddim\\"(\\"geometry\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coorddim\\"(\\"geometry\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coorddim\\"(\\"geometry\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coorddim\\"(\\"geometry\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coveredby\\"(\\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coveredby\\"(\\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coveredby\\"(\\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coveredby\\"(\\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coveredby\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coveredby\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coveredby\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coveredby\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coveredby\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coveredby\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coveredby\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_coveredby\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_covers\\"(\\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_covers\\"(\\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_covers\\"(\\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_covers\\"(\\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_covers\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_covers\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_covers\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_covers\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_covers\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_covers\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_covers\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_covers\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_cpawithin\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_cpawithin\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_cpawithin\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_cpawithin\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_crosses\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_crosses\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_crosses\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_crosses\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_curvetoline\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"tol\\" double precision, \\"toltype\\" integer, \\"flags\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_curvetoline\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"tol\\" double precision, \\"toltype\\" integer, \\"flags\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_curvetoline\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"tol\\" double precision, \\"toltype\\" integer, \\"flags\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_curvetoline\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"tol\\" double precision, \\"toltype\\" integer, \\"flags\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_delaunaytriangles\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"flags\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_delaunaytriangles\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"flags\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_delaunaytriangles\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"flags\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_delaunaytriangles\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"flags\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dfullywithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_difference\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_difference\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_difference\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_difference\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dimension\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dimension\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dimension\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dimension\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_disjoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_disjoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_disjoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_disjoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distance\\"(\\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distance\\"(\\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distance\\"(\\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distance\\"(\\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distance\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distance\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distance\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distance\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancecpa\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancecpa\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancecpa\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancecpa\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancesphere\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancesphere\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancesphere\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancesphere\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancesphere\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"radius\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancesphere\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"radius\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancesphere\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"radius\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancesphere\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"radius\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancespheroid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancespheroid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancespheroid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancespheroid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancespheroid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"public\\".\\"spheroid\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancespheroid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"public\\".\\"spheroid\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancespheroid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"public\\".\\"spheroid\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_distancespheroid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"public\\".\\"spheroid\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dump\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dump\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dump\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dump\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dumppoints\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dumppoints\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dumppoints\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dumppoints\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dumprings\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dumprings\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dumprings\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dumprings\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dumpsegments\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dumpsegments\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dumpsegments\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dumpsegments\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dwithin\\"(\\"text\\", \\"text\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dwithin\\"(\\"text\\", \\"text\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dwithin\\"(\\"text\\", \\"text\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dwithin\\"(\\"text\\", \\"text\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dwithin\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dwithin\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\", \\"tolerance\\" double precision, \\"use_spheroid\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dwithin\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\", \\"tolerance\\" double precision, \\"use_spheroid\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dwithin\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\", \\"tolerance\\" double precision, \\"use_spheroid\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_dwithin\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\", \\"tolerance\\" double precision, \\"use_spheroid\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_endpoint\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_endpoint\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_endpoint\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_endpoint\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_envelope\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_envelope\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_envelope\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_envelope\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_equals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_equals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_equals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_equals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_estimatedextent\\"(\\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_estimatedextent\\"(\\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_estimatedextent\\"(\\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_estimatedextent\\"(\\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_estimatedextent\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_estimatedextent\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_estimatedextent\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_estimatedextent\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_estimatedextent\\"(\\"text\\", \\"text\\", \\"text\\", boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_estimatedextent\\"(\\"text\\", \\"text\\", \\"text\\", boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_estimatedextent\\"(\\"text\\", \\"text\\", \\"text\\", boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_estimatedextent\\"(\\"text\\", \\"text\\", \\"text\\", boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"public\\".\\"box2d\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"public\\".\\"box2d\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"public\\".\\"box2d\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"public\\".\\"box2d\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"public\\".\\"box3d\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"public\\".\\"box3d\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"public\\".\\"box3d\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"public\\".\\"box3d\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"box\\" \\"public\\".\\"box2d\\", \\"dx\\" double precision, \\"dy\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"box\\" \\"public\\".\\"box2d\\", \\"dx\\" double precision, \\"dy\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"box\\" \\"public\\".\\"box2d\\", \\"dx\\" double precision, \\"dy\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"box\\" \\"public\\".\\"box2d\\", \\"dx\\" double precision, \\"dy\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"box\\" \\"public\\".\\"box3d\\", \\"dx\\" double precision, \\"dy\\" double precision, \\"dz\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"box\\" \\"public\\".\\"box3d\\", \\"dx\\" double precision, \\"dy\\" double precision, \\"dz\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"box\\" \\"public\\".\\"box3d\\", \\"dx\\" double precision, \\"dy\\" double precision, \\"dz\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"box\\" \\"public\\".\\"box3d\\", \\"dx\\" double precision, \\"dy\\" double precision, \\"dz\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"dx\\" double precision, \\"dy\\" double precision, \\"dz\\" double precision, \\"dm\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"dx\\" double precision, \\"dy\\" double precision, \\"dz\\" double precision, \\"dm\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"dx\\" double precision, \\"dy\\" double precision, \\"dz\\" double precision, \\"dm\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_expand\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"dx\\" double precision, \\"dy\\" double precision, \\"dz\\" double precision, \\"dm\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_exteriorring\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_exteriorring\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_exteriorring\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_exteriorring\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_filterbym\\"(\\"public\\".\\"geometry\\", double precision, double precision, boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_filterbym\\"(\\"public\\".\\"geometry\\", double precision, double precision, boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_filterbym\\"(\\"public\\".\\"geometry\\", double precision, double precision, boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_filterbym\\"(\\"public\\".\\"geometry\\", double precision, double precision, boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_findextent\\"(\\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_findextent\\"(\\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_findextent\\"(\\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_findextent\\"(\\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_findextent\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_findextent\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_findextent\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_findextent\\"(\\"text\\", \\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_flipcoordinates\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_flipcoordinates\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_flipcoordinates\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_flipcoordinates\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force2d\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force2d\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force2d\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force2d\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force3d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"zvalue\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force3d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"zvalue\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force3d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"zvalue\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force3d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"zvalue\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force3dm\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"mvalue\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force3dm\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"mvalue\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force3dm\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"mvalue\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force3dm\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"mvalue\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force3dz\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"zvalue\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force3dz\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"zvalue\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force3dz\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"zvalue\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force3dz\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"zvalue\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force4d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"zvalue\\" double precision, \\"mvalue\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force4d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"zvalue\\" double precision, \\"mvalue\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force4d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"zvalue\\" double precision, \\"mvalue\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_force4d\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"zvalue\\" double precision, \\"mvalue\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcecollection\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcecollection\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcecollection\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcecollection\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcecurve\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcecurve\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcecurve\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcecurve\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcepolygonccw\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcepolygonccw\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcepolygonccw\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcepolygonccw\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcepolygoncw\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcepolygoncw\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcepolygoncw\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcepolygoncw\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcerhr\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcerhr\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcerhr\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcerhr\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcesfs\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcesfs\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcesfs\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcesfs\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcesfs\\"(\\"public\\".\\"geometry\\", \\"version\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcesfs\\"(\\"public\\".\\"geometry\\", \\"version\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcesfs\\"(\\"public\\".\\"geometry\\", \\"version\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_forcesfs\\"(\\"public\\".\\"geometry\\", \\"version\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_frechetdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_frechetdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_frechetdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_frechetdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_fromflatgeobuf\\"(\\"anyelement\\", \\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_fromflatgeobuf\\"(\\"anyelement\\", \\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_fromflatgeobuf\\"(\\"anyelement\\", \\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_fromflatgeobuf\\"(\\"anyelement\\", \\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_fromflatgeobuftotable\\"(\\"text\\", \\"text\\", \\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_fromflatgeobuftotable\\"(\\"text\\", \\"text\\", \\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_fromflatgeobuftotable\\"(\\"text\\", \\"text\\", \\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_fromflatgeobuftotable\\"(\\"text\\", \\"text\\", \\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_generatepoints\\"(\\"area\\" \\"public\\".\\"geometry\\", \\"npoints\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_generatepoints\\"(\\"area\\" \\"public\\".\\"geometry\\", \\"npoints\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_generatepoints\\"(\\"area\\" \\"public\\".\\"geometry\\", \\"npoints\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_generatepoints\\"(\\"area\\" \\"public\\".\\"geometry\\", \\"npoints\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_generatepoints\\"(\\"area\\" \\"public\\".\\"geometry\\", \\"npoints\\" integer, \\"seed\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_generatepoints\\"(\\"area\\" \\"public\\".\\"geometry\\", \\"npoints\\" integer, \\"seed\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_generatepoints\\"(\\"area\\" \\"public\\".\\"geometry\\", \\"npoints\\" integer, \\"seed\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_generatepoints\\"(\\"area\\" \\"public\\".\\"geometry\\", \\"npoints\\" integer, \\"seed\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geogfromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geogfromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geogfromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geogfromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geogfromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geogfromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geogfromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geogfromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geographyfromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geographyfromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geographyfromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geographyfromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geohash\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxchars\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geohash\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxchars\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geohash\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxchars\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geohash\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"maxchars\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geohash\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxchars\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geohash\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxchars\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geohash\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxchars\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geohash\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxchars\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromwkb\\"(\\"bytea\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromwkb\\"(\\"bytea\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromwkb\\"(\\"bytea\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomcollfromwkb\\"(\\"bytea\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometricmedian\\"(\\"g\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"max_iter\\" integer, \\"fail_if_not_converged\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometricmedian\\"(\\"g\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"max_iter\\" integer, \\"fail_if_not_converged\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometricmedian\\"(\\"g\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"max_iter\\" integer, \\"fail_if_not_converged\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometricmedian\\"(\\"g\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"max_iter\\" integer, \\"fail_if_not_converged\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometryfromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometryfromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometryfromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometryfromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometryfromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometryfromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometryfromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometryfromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometryn\\"(\\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometryn\\"(\\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometryn\\"(\\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometryn\\"(\\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometrytype\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometrytype\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometrytype\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geometrytype\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromewkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromewkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromewkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromewkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromewkt\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromewkt\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromewkt\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromewkt\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeohash\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeohash\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeohash\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeohash\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeojson\\"(json) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeojson\\"(json) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeojson\\"(json) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeojson\\"(json) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeojson\\"(\\"jsonb\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeojson\\"(\\"jsonb\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeojson\\"(\\"jsonb\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeojson\\"(\\"jsonb\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeojson\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeojson\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeojson\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgeojson\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgml\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgml\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgml\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgml\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgml\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgml\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgml\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromgml\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromkml\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromkml\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromkml\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromkml\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfrommarc21\\"(\\"marc21xml\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfrommarc21\\"(\\"marc21xml\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfrommarc21\\"(\\"marc21xml\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfrommarc21\\"(\\"marc21xml\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromtwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromtwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromtwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromtwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromwkb\\"(\\"bytea\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromwkb\\"(\\"bytea\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromwkb\\"(\\"bytea\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_geomfromwkb\\"(\\"bytea\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_gmltosql\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_gmltosql\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_gmltosql\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_gmltosql\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_gmltosql\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_gmltosql\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_gmltosql\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_gmltosql\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hasarc\\"(\\"geometry\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hasarc\\"(\\"geometry\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hasarc\\"(\\"geometry\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hasarc\\"(\\"geometry\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hausdorffdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hausdorffdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hausdorffdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hausdorffdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hausdorffdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hausdorffdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hausdorffdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hausdorffdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hexagon\\"(\\"size\\" double precision, \\"cell_i\\" integer, \\"cell_j\\" integer, \\"origin\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hexagon\\"(\\"size\\" double precision, \\"cell_i\\" integer, \\"cell_j\\" integer, \\"origin\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hexagon\\"(\\"size\\" double precision, \\"cell_i\\" integer, \\"cell_j\\" integer, \\"origin\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hexagon\\"(\\"size\\" double precision, \\"cell_i\\" integer, \\"cell_j\\" integer, \\"origin\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hexagongrid\\"(\\"size\\" double precision, \\"bounds\\" \\"public\\".\\"geometry\\", OUT \\"geom\\" \\"public\\".\\"geometry\\", OUT \\"i\\" integer, OUT \\"j\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hexagongrid\\"(\\"size\\" double precision, \\"bounds\\" \\"public\\".\\"geometry\\", OUT \\"geom\\" \\"public\\".\\"geometry\\", OUT \\"i\\" integer, OUT \\"j\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hexagongrid\\"(\\"size\\" double precision, \\"bounds\\" \\"public\\".\\"geometry\\", OUT \\"geom\\" \\"public\\".\\"geometry\\", OUT \\"i\\" integer, OUT \\"j\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_hexagongrid\\"(\\"size\\" double precision, \\"bounds\\" \\"public\\".\\"geometry\\", OUT \\"geom\\" \\"public\\".\\"geometry\\", OUT \\"i\\" integer, OUT \\"j\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_interiorringn\\"(\\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_interiorringn\\"(\\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_interiorringn\\"(\\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_interiorringn\\"(\\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_interpolatepoint\\"(\\"line\\" \\"public\\".\\"geometry\\", \\"point\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_interpolatepoint\\"(\\"line\\" \\"public\\".\\"geometry\\", \\"point\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_interpolatepoint\\"(\\"line\\" \\"public\\".\\"geometry\\", \\"point\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_interpolatepoint\\"(\\"line\\" \\"public\\".\\"geometry\\", \\"point\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersection\\"(\\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersection\\"(\\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersection\\"(\\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersection\\"(\\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersection\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersection\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersection\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersection\\"(\\"public\\".\\"geography\\", \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersection\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersection\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersection\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersection\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersects\\"(\\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersects\\"(\\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersects\\"(\\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersects\\"(\\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersects\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersects\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersects\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersects\\"(\\"geog1\\" \\"public\\".\\"geography\\", \\"geog2\\" \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_intersects\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isclosed\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isclosed\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isclosed\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isclosed\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_iscollection\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_iscollection\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_iscollection\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_iscollection\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isempty\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isempty\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isempty\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isempty\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ispolygonccw\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ispolygonccw\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ispolygonccw\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ispolygonccw\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ispolygoncw\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ispolygoncw\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ispolygoncw\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ispolygoncw\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isring\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isring\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isring\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isring\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_issimple\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_issimple\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_issimple\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_issimple\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalid\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalid\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalid\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalid\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalid\\"(\\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalid\\"(\\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalid\\"(\\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalid\\"(\\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvaliddetail\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"flags\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvaliddetail\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"flags\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvaliddetail\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"flags\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvaliddetail\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"flags\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalidreason\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalidreason\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalidreason\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalidreason\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalidreason\\"(\\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalidreason\\"(\\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalidreason\\"(\\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalidreason\\"(\\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalidtrajectory\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalidtrajectory\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalidtrajectory\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_isvalidtrajectory\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length2d\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length2d\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length2d\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length2d\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length2dspheroid\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"spheroid\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length2dspheroid\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"spheroid\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length2dspheroid\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"spheroid\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_length2dspheroid\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"spheroid\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_lengthspheroid\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"spheroid\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_lengthspheroid\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"spheroid\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_lengthspheroid\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"spheroid\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_lengthspheroid\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"spheroid\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_letters\\"(\\"letters\\" \\"text\\", \\"font\\" json) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_letters\\"(\\"letters\\" \\"text\\", \\"font\\" json) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_letters\\"(\\"letters\\" \\"text\\", \\"font\\" json) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_letters\\"(\\"letters\\" \\"text\\", \\"font\\" json) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linecrossingdirection\\"(\\"line1\\" \\"public\\".\\"geometry\\", \\"line2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linecrossingdirection\\"(\\"line1\\" \\"public\\".\\"geometry\\", \\"line2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linecrossingdirection\\"(\\"line1\\" \\"public\\".\\"geometry\\", \\"line2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linecrossingdirection\\"(\\"line1\\" \\"public\\".\\"geometry\\", \\"line2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromencodedpolyline\\"(\\"txtin\\" \\"text\\", \\"nprecision\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromencodedpolyline\\"(\\"txtin\\" \\"text\\", \\"nprecision\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromencodedpolyline\\"(\\"txtin\\" \\"text\\", \\"nprecision\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromencodedpolyline\\"(\\"txtin\\" \\"text\\", \\"nprecision\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefrommultipoint\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefrommultipoint\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefrommultipoint\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefrommultipoint\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromwkb\\"(\\"bytea\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromwkb\\"(\\"bytea\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromwkb\\"(\\"bytea\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linefromwkb\\"(\\"bytea\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_lineinterpolatepoint\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_lineinterpolatepoint\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_lineinterpolatepoint\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_lineinterpolatepoint\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_lineinterpolatepoints\\"(\\"public\\".\\"geometry\\", double precision, \\"repeat\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_lineinterpolatepoints\\"(\\"public\\".\\"geometry\\", double precision, \\"repeat\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_lineinterpolatepoints\\"(\\"public\\".\\"geometry\\", double precision, \\"repeat\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_lineinterpolatepoints\\"(\\"public\\".\\"geometry\\", double precision, \\"repeat\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linelocatepoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linelocatepoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linelocatepoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linelocatepoint\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linemerge\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linemerge\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linemerge\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linemerge\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linemerge\\"(\\"public\\".\\"geometry\\", boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linemerge\\"(\\"public\\".\\"geometry\\", boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linemerge\\"(\\"public\\".\\"geometry\\", boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linemerge\\"(\\"public\\".\\"geometry\\", boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linestringfromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linestringfromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linestringfromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linestringfromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linestringfromwkb\\"(\\"bytea\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linestringfromwkb\\"(\\"bytea\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linestringfromwkb\\"(\\"bytea\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linestringfromwkb\\"(\\"bytea\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linesubstring\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linesubstring\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linesubstring\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linesubstring\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linetocurve\\"(\\"geometry\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linetocurve\\"(\\"geometry\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linetocurve\\"(\\"geometry\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_linetocurve\\"(\\"geometry\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_locatealong\\"(\\"geometry\\" \\"public\\".\\"geometry\\", \\"measure\\" double precision, \\"leftrightoffset\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_locatealong\\"(\\"geometry\\" \\"public\\".\\"geometry\\", \\"measure\\" double precision, \\"leftrightoffset\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_locatealong\\"(\\"geometry\\" \\"public\\".\\"geometry\\", \\"measure\\" double precision, \\"leftrightoffset\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_locatealong\\"(\\"geometry\\" \\"public\\".\\"geometry\\", \\"measure\\" double precision, \\"leftrightoffset\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_locatebetween\\"(\\"geometry\\" \\"public\\".\\"geometry\\", \\"frommeasure\\" double precision, \\"tomeasure\\" double precision, \\"leftrightoffset\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_locatebetween\\"(\\"geometry\\" \\"public\\".\\"geometry\\", \\"frommeasure\\" double precision, \\"tomeasure\\" double precision, \\"leftrightoffset\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_locatebetween\\"(\\"geometry\\" \\"public\\".\\"geometry\\", \\"frommeasure\\" double precision, \\"tomeasure\\" double precision, \\"leftrightoffset\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_locatebetween\\"(\\"geometry\\" \\"public\\".\\"geometry\\", \\"frommeasure\\" double precision, \\"tomeasure\\" double precision, \\"leftrightoffset\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_locatebetweenelevations\\"(\\"geometry\\" \\"public\\".\\"geometry\\", \\"fromelevation\\" double precision, \\"toelevation\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_locatebetweenelevations\\"(\\"geometry\\" \\"public\\".\\"geometry\\", \\"fromelevation\\" double precision, \\"toelevation\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_locatebetweenelevations\\"(\\"geometry\\" \\"public\\".\\"geometry\\", \\"fromelevation\\" double precision, \\"toelevation\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_locatebetweenelevations\\"(\\"geometry\\" \\"public\\".\\"geometry\\", \\"fromelevation\\" double precision, \\"toelevation\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_longestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_longestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_longestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_longestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_m\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_m\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_m\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_m\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makebox2d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makebox2d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makebox2d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makebox2d\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeenvelope\\"(double precision, double precision, double precision, double precision, integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeenvelope\\"(double precision, double precision, double precision, double precision, integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeenvelope\\"(double precision, double precision, double precision, double precision, integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeenvelope\\"(double precision, double precision, double precision, double precision, integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeline\\"(\\"public\\".\\"geometry\\"[]) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeline\\"(\\"public\\".\\"geometry\\"[]) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeline\\"(\\"public\\".\\"geometry\\"[]) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeline\\"(\\"public\\".\\"geometry\\"[]) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepoint\\"(double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepoint\\"(double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepoint\\"(double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepoint\\"(double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepoint\\"(double precision, double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepoint\\"(double precision, double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepoint\\"(double precision, double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepoint\\"(double precision, double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepoint\\"(double precision, double precision, double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepoint\\"(double precision, double precision, double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepoint\\"(double precision, double precision, double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepoint\\"(double precision, double precision, double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepointm\\"(double precision, double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepointm\\"(double precision, double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepointm\\"(double precision, double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepointm\\"(double precision, double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepolygon\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepolygon\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepolygon\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepolygon\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepolygon\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\"[]) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepolygon\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\"[]) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepolygon\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\"[]) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makepolygon\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\"[]) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makevalid\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makevalid\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makevalid\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makevalid\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makevalid\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"params\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makevalid\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"params\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makevalid\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"params\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makevalid\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"params\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_maxdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_maxdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_maxdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_maxdistance\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_maximuminscribedcircle\\"(\\"public\\".\\"geometry\\", OUT \\"center\\" \\"public\\".\\"geometry\\", OUT \\"nearest\\" \\"public\\".\\"geometry\\", OUT \\"radius\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_maximuminscribedcircle\\"(\\"public\\".\\"geometry\\", OUT \\"center\\" \\"public\\".\\"geometry\\", OUT \\"nearest\\" \\"public\\".\\"geometry\\", OUT \\"radius\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_maximuminscribedcircle\\"(\\"public\\".\\"geometry\\", OUT \\"center\\" \\"public\\".\\"geometry\\", OUT \\"nearest\\" \\"public\\".\\"geometry\\", OUT \\"radius\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_maximuminscribedcircle\\"(\\"public\\".\\"geometry\\", OUT \\"center\\" \\"public\\".\\"geometry\\", OUT \\"nearest\\" \\"public\\".\\"geometry\\", OUT \\"radius\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_memsize\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_memsize\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_memsize\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_memsize\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumboundingcircle\\"(\\"inputgeom\\" \\"public\\".\\"geometry\\", \\"segs_per_quarter\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumboundingcircle\\"(\\"inputgeom\\" \\"public\\".\\"geometry\\", \\"segs_per_quarter\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumboundingcircle\\"(\\"inputgeom\\" \\"public\\".\\"geometry\\", \\"segs_per_quarter\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumboundingcircle\\"(\\"inputgeom\\" \\"public\\".\\"geometry\\", \\"segs_per_quarter\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumboundingradius\\"(\\"public\\".\\"geometry\\", OUT \\"center\\" \\"public\\".\\"geometry\\", OUT \\"radius\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumboundingradius\\"(\\"public\\".\\"geometry\\", OUT \\"center\\" \\"public\\".\\"geometry\\", OUT \\"radius\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumboundingradius\\"(\\"public\\".\\"geometry\\", OUT \\"center\\" \\"public\\".\\"geometry\\", OUT \\"radius\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumboundingradius\\"(\\"public\\".\\"geometry\\", OUT \\"center\\" \\"public\\".\\"geometry\\", OUT \\"radius\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumclearance\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumclearance\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumclearance\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumclearance\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumclearanceline\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumclearanceline\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumclearanceline\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_minimumclearanceline\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromwkb\\"(\\"bytea\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromwkb\\"(\\"bytea\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromwkb\\"(\\"bytea\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mlinefromwkb\\"(\\"bytea\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromwkb\\"(\\"bytea\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromwkb\\"(\\"bytea\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromwkb\\"(\\"bytea\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpointfromwkb\\"(\\"bytea\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromwkb\\"(\\"bytea\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromwkb\\"(\\"bytea\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromwkb\\"(\\"bytea\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_mpolyfromwkb\\"(\\"bytea\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multi\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multi\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multi\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multi\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multilinefromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multilinefromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multilinefromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multilinefromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multilinestringfromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multilinestringfromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multilinestringfromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multilinestringfromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multilinestringfromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multilinestringfromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multilinestringfromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multilinestringfromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipointfromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipointfromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipointfromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipointfromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipointfromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipointfromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipointfromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipointfromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipointfromwkb\\"(\\"bytea\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipointfromwkb\\"(\\"bytea\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipointfromwkb\\"(\\"bytea\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipointfromwkb\\"(\\"bytea\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolyfromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolyfromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolyfromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolyfromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolyfromwkb\\"(\\"bytea\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolyfromwkb\\"(\\"bytea\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolyfromwkb\\"(\\"bytea\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolyfromwkb\\"(\\"bytea\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolygonfromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolygonfromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolygonfromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolygonfromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolygonfromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolygonfromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolygonfromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_multipolygonfromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ndims\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ndims\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ndims\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ndims\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_node\\"(\\"g\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_node\\"(\\"g\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_node\\"(\\"g\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_node\\"(\\"g\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_normalize\\"(\\"geom\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_normalize\\"(\\"geom\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_normalize\\"(\\"geom\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_normalize\\"(\\"geom\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_npoints\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_npoints\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_npoints\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_npoints\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_nrings\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_nrings\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_nrings\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_nrings\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numgeometries\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numgeometries\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numgeometries\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numgeometries\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numinteriorring\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numinteriorring\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numinteriorring\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numinteriorring\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numinteriorrings\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numinteriorrings\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numinteriorrings\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numinteriorrings\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numpatches\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numpatches\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numpatches\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numpatches\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numpoints\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numpoints\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numpoints\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_numpoints\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_offsetcurve\\"(\\"line\\" \\"public\\".\\"geometry\\", \\"distance\\" double precision, \\"params\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_offsetcurve\\"(\\"line\\" \\"public\\".\\"geometry\\", \\"distance\\" double precision, \\"params\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_offsetcurve\\"(\\"line\\" \\"public\\".\\"geometry\\", \\"distance\\" double precision, \\"params\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_offsetcurve\\"(\\"line\\" \\"public\\".\\"geometry\\", \\"distance\\" double precision, \\"params\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_orderingequals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_orderingequals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_orderingequals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_orderingequals\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_orientedenvelope\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_orientedenvelope\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_orientedenvelope\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_orientedenvelope\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_overlaps\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_overlaps\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_overlaps\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_overlaps\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_patchn\\"(\\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_patchn\\"(\\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_patchn\\"(\\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_patchn\\"(\\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_perimeter\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_perimeter\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_perimeter\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_perimeter\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_perimeter\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_perimeter\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_perimeter\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_perimeter\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"use_spheroid\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_perimeter2d\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_perimeter2d\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_perimeter2d\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_perimeter2d\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_point\\"(double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_point\\"(double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_point\\"(double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_point\\"(double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_point\\"(double precision, double precision, \\"srid\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_point\\"(double precision, double precision, \\"srid\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_point\\"(double precision, double precision, \\"srid\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_point\\"(double precision, double precision, \\"srid\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromgeohash\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromgeohash\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromgeohash\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromgeohash\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromwkb\\"(\\"bytea\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromwkb\\"(\\"bytea\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromwkb\\"(\\"bytea\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointfromwkb\\"(\\"bytea\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointinsidecircle\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointinsidecircle\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointinsidecircle\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointinsidecircle\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointm\\"(\\"xcoordinate\\" double precision, \\"ycoordinate\\" double precision, \\"mcoordinate\\" double precision, \\"srid\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointm\\"(\\"xcoordinate\\" double precision, \\"ycoordinate\\" double precision, \\"mcoordinate\\" double precision, \\"srid\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointm\\"(\\"xcoordinate\\" double precision, \\"ycoordinate\\" double precision, \\"mcoordinate\\" double precision, \\"srid\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointm\\"(\\"xcoordinate\\" double precision, \\"ycoordinate\\" double precision, \\"mcoordinate\\" double precision, \\"srid\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointn\\"(\\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointn\\"(\\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointn\\"(\\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointn\\"(\\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointonsurface\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointonsurface\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointonsurface\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointonsurface\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_points\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_points\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_points\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_points\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointz\\"(\\"xcoordinate\\" double precision, \\"ycoordinate\\" double precision, \\"zcoordinate\\" double precision, \\"srid\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointz\\"(\\"xcoordinate\\" double precision, \\"ycoordinate\\" double precision, \\"zcoordinate\\" double precision, \\"srid\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointz\\"(\\"xcoordinate\\" double precision, \\"ycoordinate\\" double precision, \\"zcoordinate\\" double precision, \\"srid\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointz\\"(\\"xcoordinate\\" double precision, \\"ycoordinate\\" double precision, \\"zcoordinate\\" double precision, \\"srid\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointzm\\"(\\"xcoordinate\\" double precision, \\"ycoordinate\\" double precision, \\"zcoordinate\\" double precision, \\"mcoordinate\\" double precision, \\"srid\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointzm\\"(\\"xcoordinate\\" double precision, \\"ycoordinate\\" double precision, \\"zcoordinate\\" double precision, \\"mcoordinate\\" double precision, \\"srid\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointzm\\"(\\"xcoordinate\\" double precision, \\"ycoordinate\\" double precision, \\"zcoordinate\\" double precision, \\"mcoordinate\\" double precision, \\"srid\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_pointzm\\"(\\"xcoordinate\\" double precision, \\"ycoordinate\\" double precision, \\"zcoordinate\\" double precision, \\"mcoordinate\\" double precision, \\"srid\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromwkb\\"(\\"bytea\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromwkb\\"(\\"bytea\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromwkb\\"(\\"bytea\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polyfromwkb\\"(\\"bytea\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygon\\"(\\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygon\\"(\\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygon\\"(\\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygon\\"(\\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromtext\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromtext\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromtext\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromtext\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromtext\\"(\\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromtext\\"(\\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromtext\\"(\\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromtext\\"(\\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromwkb\\"(\\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromwkb\\"(\\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromwkb\\"(\\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromwkb\\"(\\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromwkb\\"(\\"bytea\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromwkb\\"(\\"bytea\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromwkb\\"(\\"bytea\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonfromwkb\\"(\\"bytea\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonize\\"(\\"public\\".\\"geometry\\"[]) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonize\\"(\\"public\\".\\"geometry\\"[]) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonize\\"(\\"public\\".\\"geometry\\"[]) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonize\\"(\\"public\\".\\"geometry\\"[]) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_project\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"distance\\" double precision, \\"azimuth\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_project\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"distance\\" double precision, \\"azimuth\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_project\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"distance\\" double precision, \\"azimuth\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_project\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"distance\\" double precision, \\"azimuth\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_quantizecoordinates\\"(\\"g\\" \\"public\\".\\"geometry\\", \\"prec_x\\" integer, \\"prec_y\\" integer, \\"prec_z\\" integer, \\"prec_m\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_quantizecoordinates\\"(\\"g\\" \\"public\\".\\"geometry\\", \\"prec_x\\" integer, \\"prec_y\\" integer, \\"prec_z\\" integer, \\"prec_m\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_quantizecoordinates\\"(\\"g\\" \\"public\\".\\"geometry\\", \\"prec_x\\" integer, \\"prec_y\\" integer, \\"prec_z\\" integer, \\"prec_m\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_quantizecoordinates\\"(\\"g\\" \\"public\\".\\"geometry\\", \\"prec_x\\" integer, \\"prec_y\\" integer, \\"prec_z\\" integer, \\"prec_m\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_reduceprecision\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_reduceprecision\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_reduceprecision\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_reduceprecision\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relate\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relate\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relate\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relate\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relate\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relate\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relate\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relate\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relate\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relate\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relate\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relate\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relatematch\\"(\\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relatematch\\"(\\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relatematch\\"(\\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_relatematch\\"(\\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_removepoint\\"(\\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_removepoint\\"(\\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_removepoint\\"(\\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_removepoint\\"(\\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_removerepeatedpoints\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_removerepeatedpoints\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_removerepeatedpoints\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_removerepeatedpoints\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_reverse\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_reverse\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_reverse\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_reverse\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotate\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotate\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotate\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotate\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotate\\"(\\"public\\".\\"geometry\\", double precision, \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotate\\"(\\"public\\".\\"geometry\\", double precision, \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotate\\"(\\"public\\".\\"geometry\\", double precision, \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotate\\"(\\"public\\".\\"geometry\\", double precision, \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotate\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotate\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotate\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotate\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotatex\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotatex\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotatex\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotatex\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotatey\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotatey\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotatey\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotatey\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotatez\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotatez\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotatez\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_rotatez\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\", \\"origin\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\", \\"origin\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\", \\"origin\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\", \\"origin\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scale\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scroll\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scroll\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scroll\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_scroll\\"(\\"public\\".\\"geometry\\", \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_segmentize\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"max_segment_length\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_segmentize\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"max_segment_length\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_segmentize\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"max_segment_length\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_segmentize\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"max_segment_length\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_segmentize\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_segmentize\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_segmentize\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_segmentize\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_seteffectivearea\\"(\\"public\\".\\"geometry\\", double precision, integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_seteffectivearea\\"(\\"public\\".\\"geometry\\", double precision, integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_seteffectivearea\\"(\\"public\\".\\"geometry\\", double precision, integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_seteffectivearea\\"(\\"public\\".\\"geometry\\", double precision, integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_setpoint\\"(\\"public\\".\\"geometry\\", integer, \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_setpoint\\"(\\"public\\".\\"geometry\\", integer, \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_setpoint\\"(\\"public\\".\\"geometry\\", integer, \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_setpoint\\"(\\"public\\".\\"geometry\\", integer, \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_setsrid\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"srid\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_setsrid\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"srid\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_setsrid\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"srid\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_setsrid\\"(\\"geog\\" \\"public\\".\\"geography\\", \\"srid\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_setsrid\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"srid\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_setsrid\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"srid\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_setsrid\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"srid\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_setsrid\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"srid\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_sharedpaths\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_sharedpaths\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_sharedpaths\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_sharedpaths\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_shiftlongitude\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_shiftlongitude\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_shiftlongitude\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_shiftlongitude\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_shortestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_shortestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_shortestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_shortestline\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplify\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplify\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplify\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplify\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplify\\"(\\"public\\".\\"geometry\\", double precision, boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplify\\"(\\"public\\".\\"geometry\\", double precision, boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplify\\"(\\"public\\".\\"geometry\\", double precision, boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplify\\"(\\"public\\".\\"geometry\\", double precision, boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplifypolygonhull\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"vertex_fraction\\" double precision, \\"is_outer\\" boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplifypolygonhull\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"vertex_fraction\\" double precision, \\"is_outer\\" boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplifypolygonhull\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"vertex_fraction\\" double precision, \\"is_outer\\" boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplifypolygonhull\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"vertex_fraction\\" double precision, \\"is_outer\\" boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplifypreservetopology\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplifypreservetopology\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplifypreservetopology\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplifypreservetopology\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplifyvw\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplifyvw\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplifyvw\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_simplifyvw\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snap\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snap\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snap\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snap\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_snaptogrid\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_split\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_split\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_split\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_split\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_square\\"(\\"size\\" double precision, \\"cell_i\\" integer, \\"cell_j\\" integer, \\"origin\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_square\\"(\\"size\\" double precision, \\"cell_i\\" integer, \\"cell_j\\" integer, \\"origin\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_square\\"(\\"size\\" double precision, \\"cell_i\\" integer, \\"cell_j\\" integer, \\"origin\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_square\\"(\\"size\\" double precision, \\"cell_i\\" integer, \\"cell_j\\" integer, \\"origin\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_squaregrid\\"(\\"size\\" double precision, \\"bounds\\" \\"public\\".\\"geometry\\", OUT \\"geom\\" \\"public\\".\\"geometry\\", OUT \\"i\\" integer, OUT \\"j\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_squaregrid\\"(\\"size\\" double precision, \\"bounds\\" \\"public\\".\\"geometry\\", OUT \\"geom\\" \\"public\\".\\"geometry\\", OUT \\"i\\" integer, OUT \\"j\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_squaregrid\\"(\\"size\\" double precision, \\"bounds\\" \\"public\\".\\"geometry\\", OUT \\"geom\\" \\"public\\".\\"geometry\\", OUT \\"i\\" integer, OUT \\"j\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_squaregrid\\"(\\"size\\" double precision, \\"bounds\\" \\"public\\".\\"geometry\\", OUT \\"geom\\" \\"public\\".\\"geometry\\", OUT \\"i\\" integer, OUT \\"j\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_srid\\"(\\"geog\\" \\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_srid\\"(\\"geog\\" \\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_srid\\"(\\"geog\\" \\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_srid\\"(\\"geog\\" \\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_srid\\"(\\"geom\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_srid\\"(\\"geom\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_srid\\"(\\"geom\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_srid\\"(\\"geom\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_startpoint\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_startpoint\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_startpoint\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_startpoint\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_subdivide\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxvertices\\" integer, \\"gridsize\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_subdivide\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxvertices\\" integer, \\"gridsize\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_subdivide\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxvertices\\" integer, \\"gridsize\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_subdivide\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"maxvertices\\" integer, \\"gridsize\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_summary\\"(\\"public\\".\\"geography\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_summary\\"(\\"public\\".\\"geography\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_summary\\"(\\"public\\".\\"geography\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_summary\\"(\\"public\\".\\"geography\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_summary\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_summary\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_summary\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_summary\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_swapordinates\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"ords\\" \\"cstring\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_swapordinates\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"ords\\" \\"cstring\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_swapordinates\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"ords\\" \\"cstring\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_swapordinates\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"ords\\" \\"cstring\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_symdifference\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_symdifference\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_symdifference\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_symdifference\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_symmetricdifference\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_symmetricdifference\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_symmetricdifference\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_symmetricdifference\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_tileenvelope\\"(\\"zoom\\" integer, \\"x\\" integer, \\"y\\" integer, \\"bounds\\" \\"public\\".\\"geometry\\", \\"margin\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_tileenvelope\\"(\\"zoom\\" integer, \\"x\\" integer, \\"y\\" integer, \\"bounds\\" \\"public\\".\\"geometry\\", \\"margin\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_tileenvelope\\"(\\"zoom\\" integer, \\"x\\" integer, \\"y\\" integer, \\"bounds\\" \\"public\\".\\"geometry\\", \\"margin\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_tileenvelope\\"(\\"zoom\\" integer, \\"x\\" integer, \\"y\\" integer, \\"bounds\\" \\"public\\".\\"geometry\\", \\"margin\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_touches\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_touches\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_touches\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_touches\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"public\\".\\"geometry\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"public\\".\\"geometry\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"public\\".\\"geometry\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"public\\".\\"geometry\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"to_proj\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"to_proj\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"to_proj\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"to_proj\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"from_proj\\" \\"text\\", \\"to_srid\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"from_proj\\" \\"text\\", \\"to_srid\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"from_proj\\" \\"text\\", \\"to_srid\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"from_proj\\" \\"text\\", \\"to_srid\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"from_proj\\" \\"text\\", \\"to_proj\\" \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"from_proj\\" \\"text\\", \\"to_proj\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"from_proj\\" \\"text\\", \\"to_proj\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transform\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"from_proj\\" \\"text\\", \\"to_proj\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_translate\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_translate\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_translate\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_translate\\"(\\"public\\".\\"geometry\\", double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_translate\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_translate\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_translate\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_translate\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transscale\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transscale\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transscale\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_transscale\\"(\\"public\\".\\"geometry\\", double precision, double precision, double precision, double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_triangulatepolygon\\"(\\"g1\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_triangulatepolygon\\"(\\"g1\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_triangulatepolygon\\"(\\"g1\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_triangulatepolygon\\"(\\"g1\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_unaryunion\\"(\\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_unaryunion\\"(\\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_unaryunion\\"(\\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_unaryunion\\"(\\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"public\\".\\"geometry\\"[]) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"public\\".\\"geometry\\"[]) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"public\\".\\"geometry\\"[]) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"public\\".\\"geometry\\"[]) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\", \\"gridsize\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_voronoilines\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"extend_to\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_voronoilines\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"extend_to\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_voronoilines\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"extend_to\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_voronoilines\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"extend_to\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_voronoipolygons\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"extend_to\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_voronoipolygons\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"extend_to\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_voronoipolygons\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"extend_to\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_voronoipolygons\\"(\\"g1\\" \\"public\\".\\"geometry\\", \\"tolerance\\" double precision, \\"extend_to\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_within\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_within\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_within\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_within\\"(\\"geom1\\" \\"public\\".\\"geometry\\", \\"geom2\\" \\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_wkbtosql\\"(\\"wkb\\" \\"bytea\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_wkbtosql\\"(\\"wkb\\" \\"bytea\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_wkbtosql\\"(\\"wkb\\" \\"bytea\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_wkbtosql\\"(\\"wkb\\" \\"bytea\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_wkttosql\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_wkttosql\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_wkttosql\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_wkttosql\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_wrapx\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"wrap\\" double precision, \\"move\\" double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_wrapx\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"wrap\\" double precision, \\"move\\" double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_wrapx\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"wrap\\" double precision, \\"move\\" double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_wrapx\\"(\\"geom\\" \\"public\\".\\"geometry\\", \\"wrap\\" double precision, \\"move\\" double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_x\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_x\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_x\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_x\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_xmax\\"(\\"public\\".\\"box3d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_xmax\\"(\\"public\\".\\"box3d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_xmax\\"(\\"public\\".\\"box3d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_xmax\\"(\\"public\\".\\"box3d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_xmin\\"(\\"public\\".\\"box3d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_xmin\\"(\\"public\\".\\"box3d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_xmin\\"(\\"public\\".\\"box3d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_xmin\\"(\\"public\\".\\"box3d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_y\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_y\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_y\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_y\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ymax\\"(\\"public\\".\\"box3d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ymax\\"(\\"public\\".\\"box3d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ymax\\"(\\"public\\".\\"box3d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ymax\\"(\\"public\\".\\"box3d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ymin\\"(\\"public\\".\\"box3d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ymin\\"(\\"public\\".\\"box3d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ymin\\"(\\"public\\".\\"box3d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_ymin\\"(\\"public\\".\\"box3d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_z\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_z\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_z\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_z\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_zmax\\"(\\"public\\".\\"box3d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_zmax\\"(\\"public\\".\\"box3d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_zmax\\"(\\"public\\".\\"box3d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_zmax\\"(\\"public\\".\\"box3d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_zmflag\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_zmflag\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_zmflag\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_zmflag\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_zmin\\"(\\"public\\".\\"box3d\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_zmin\\"(\\"public\\".\\"box3d\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_zmin\\"(\\"public\\".\\"box3d\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_zmin\\"(\\"public\\".\\"box3d\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"unlockrows\\"(\\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"unlockrows\\"(\\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"unlockrows\\"(\\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"unlockrows\\"(\\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"update_inventory_on_supply_delivery\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"update_inventory_on_supply_delivery\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"update_inventory_on_supply_delivery\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"update_store_product_stock\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"update_store_product_stock\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"update_store_product_stock\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"update_updated_at_column\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"update_updated_at_column\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"update_updated_at_column\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"updategeometrysrid\\"(character varying, character varying, integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"updategeometrysrid\\"(character varying, character varying, integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"updategeometrysrid\\"(character varying, character varying, integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"updategeometrysrid\\"(character varying, character varying, integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"updategeometrysrid\\"(character varying, character varying, character varying, integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"updategeometrysrid\\"(character varying, character varying, character varying, integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"updategeometrysrid\\"(character varying, character varying, character varying, integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"updategeometrysrid\\"(character varying, character varying, character varying, integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"updategeometrysrid\\"(\\"catalogn_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid_in\\" integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"updategeometrysrid\\"(\\"catalogn_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid_in\\" integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"updategeometrysrid\\"(\\"catalogn_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid_in\\" integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"updategeometrysrid\\"(\\"catalogn_name\\" character varying, \\"schema_name\\" character varying, \\"table_name\\" character varying, \\"column_name\\" character varying, \\"new_srid_in\\" integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"validate_order_service\\"() TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"validate_order_service\\"() TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"validate_order_service\\"() TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"validate_store_service\\"(\\"p_store_id\\" \\"uuid\\", \\"p_service_type\\" \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"validate_store_service\\"(\\"p_store_id\\" \\"uuid\\", \\"p_service_type\\" \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"validate_store_service\\"(\\"p_store_id\\" \\"uuid\\", \\"p_service_type\\" \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dextent\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dextent\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dextent\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_3dextent\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asflatgeobuf\\"(\\"anyelement\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asflatgeobuf\\"(\\"anyelement\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asflatgeobuf\\"(\\"anyelement\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asflatgeobuf\\"(\\"anyelement\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asflatgeobuf\\"(\\"anyelement\\", boolean) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asflatgeobuf\\"(\\"anyelement\\", boolean) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asflatgeobuf\\"(\\"anyelement\\", boolean) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asflatgeobuf\\"(\\"anyelement\\", boolean) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asflatgeobuf\\"(\\"anyelement\\", boolean, \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asflatgeobuf\\"(\\"anyelement\\", boolean, \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asflatgeobuf\\"(\\"anyelement\\", boolean, \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asflatgeobuf\\"(\\"anyelement\\", boolean, \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeobuf\\"(\\"anyelement\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeobuf\\"(\\"anyelement\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeobuf\\"(\\"anyelement\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeobuf\\"(\\"anyelement\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeobuf\\"(\\"anyelement\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeobuf\\"(\\"anyelement\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeobuf\\"(\\"anyelement\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asgeobuf\\"(\\"anyelement\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\", integer) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\", integer) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\", integer) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\", integer) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\", integer, \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\", integer, \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\", integer, \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\", integer, \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\", integer, \\"text\\", \\"text\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\", integer, \\"text\\", \\"text\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\", integer, \\"text\\", \\"text\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_asmvt\\"(\\"anyelement\\", \\"text\\", integer, \\"text\\", \\"text\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterintersecting\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterintersecting\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterintersecting\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterintersecting\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterwithin\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterwithin\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterwithin\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_clusterwithin\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collect\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collect\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collect\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_collect\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_extent\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_extent\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_extent\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_extent\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeline\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeline\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeline\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_makeline\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_memcollect\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_memcollect\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_memcollect\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_memcollect\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_memunion\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_memunion\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_memunion\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_memunion\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonize\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonize\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonize\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_polygonize\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"public\\".\\"geometry\\") TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"public\\".\\"geometry\\") TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"public\\".\\"geometry\\") TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"public\\".\\"geometry\\") TO \\"service_role\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"public\\".\\"geometry\\", double precision) TO \\"postgres\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"public\\".\\"geometry\\", double precision) TO \\"anon\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"public\\".\\"geometry\\", double precision) TO \\"authenticated\\"","GRANT ALL ON FUNCTION \\"public\\".\\"st_union\\"(\\"public\\".\\"geometry\\", double precision) TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"categories\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"categories\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"categories\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"orders\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"orders\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"orders\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"daily_sales_analytics\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"daily_sales_analytics\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"daily_sales_analytics\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"daily_sales_summary\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"daily_sales_summary\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"daily_sales_summary\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"hourly_sales_analytics\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"hourly_sales_analytics\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"hourly_sales_analytics\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"inventory_transactions\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"inventory_transactions\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"inventory_transactions\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"notifications\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"notifications\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"notifications\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"order_items\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"order_items\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"order_items\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"order_status_history\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"order_status_history\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"order_status_history\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"payment_method_analytics\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"payment_method_analytics\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"payment_method_analytics\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"products\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"products\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"products\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"product_sales_analytics\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"product_sales_analytics\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"product_sales_analytics\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"product_sales_summary\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"product_sales_summary\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"product_sales_summary\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"profiles\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"profiles\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"profiles\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"shipments\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"shipments\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"shipments\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"store_products\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"store_products\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"store_products\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"stores\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"stores\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"stores\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"store_sales_analytics\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"store_sales_analytics\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"store_sales_analytics\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"supply_request_items\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"supply_request_items\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"supply_request_items\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"supply_requests\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"supply_requests\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"supply_requests\\" TO \\"service_role\\"","GRANT ALL ON TABLE \\"public\\".\\"system_settings\\" TO \\"anon\\"","GRANT ALL ON TABLE \\"public\\".\\"system_settings\\" TO \\"authenticated\\"","GRANT ALL ON TABLE \\"public\\".\\"system_settings\\" TO \\"service_role\\"","ALTER DEFAULT PRIVILEGES FOR ROLE \\"postgres\\" IN SCHEMA \\"public\\" GRANT ALL ON SEQUENCES TO \\"postgres\\"","ALTER DEFAULT PRIVILEGES FOR ROLE \\"postgres\\" IN SCHEMA \\"public\\" GRANT ALL ON SEQUENCES TO \\"anon\\"","ALTER DEFAULT PRIVILEGES FOR ROLE \\"postgres\\" IN SCHEMA \\"public\\" GRANT ALL ON SEQUENCES TO \\"authenticated\\"","ALTER DEFAULT PRIVILEGES FOR ROLE \\"postgres\\" IN SCHEMA \\"public\\" GRANT ALL ON SEQUENCES TO \\"service_role\\"","ALTER DEFAULT PRIVILEGES FOR ROLE \\"postgres\\" IN SCHEMA \\"public\\" GRANT ALL ON FUNCTIONS TO \\"postgres\\"","ALTER DEFAULT PRIVILEGES FOR ROLE \\"postgres\\" IN SCHEMA \\"public\\" GRANT ALL ON FUNCTIONS TO \\"anon\\"","ALTER DEFAULT PRIVILEGES FOR ROLE \\"postgres\\" IN SCHEMA \\"public\\" GRANT ALL ON FUNCTIONS TO \\"authenticated\\"","ALTER DEFAULT PRIVILEGES FOR ROLE \\"postgres\\" IN SCHEMA \\"public\\" GRANT ALL ON FUNCTIONS TO \\"service_role\\"","ALTER DEFAULT PRIVILEGES FOR ROLE \\"postgres\\" IN SCHEMA \\"public\\" GRANT ALL ON TABLES TO \\"postgres\\"","ALTER DEFAULT PRIVILEGES FOR ROLE \\"postgres\\" IN SCHEMA \\"public\\" GRANT ALL ON TABLES TO \\"anon\\"","ALTER DEFAULT PRIVILEGES FOR ROLE \\"postgres\\" IN SCHEMA \\"public\\" GRANT ALL ON TABLES TO \\"authenticated\\"","ALTER DEFAULT PRIVILEGES FOR ROLE \\"postgres\\" IN SCHEMA \\"public\\" GRANT ALL ON TABLES TO \\"service_role\\"","RESET ALL"}	remote_schema	\N	\N
\.


--
-- TOC entry 5468 (class 0 OID 19179)
-- Dependencies: 322
-- Data for Name: seed_files; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.seed_files (path, hash) FROM stdin;
\.


--
-- TOC entry 4673 (class 0 OID 18395)
-- Dependencies: 290
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: -
--

COPY topology.topology (id, name, srid, "precision", hasz) FROM stdin;
\.


--
-- TOC entry 4674 (class 0 OID 18407)
-- Dependencies: 291
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: -
--

COPY topology.layer (topology_id, layer_id, schema_name, table_name, feature_column, feature_type, level, child_id) FROM stdin;
\.


--
-- TOC entry 4670 (class 0 OID 16656)
-- Dependencies: 259
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5513 (class 0 OID 0)
-- Dependencies: 251
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 7, true);


--
-- TOC entry 5514 (class 0 OID 0)
-- Dependencies: 275
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- TOC entry 5515 (class 0 OID 0)
-- Dependencies: 289
-- Name: topology_id_seq; Type: SEQUENCE SET; Schema: topology; Owner: -
--

SELECT pg_catalog.setval('topology.topology_id_seq', 1, false);


--
-- TOC entry 4953 (class 2606 OID 16825)
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- TOC entry 4908 (class 2606 OID 16529)
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4975 (class 2606 OID 16931)
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 2606 OID 16949)
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- TOC entry 4934 (class 2606 OID 16959)
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- TOC entry 4906 (class 2606 OID 16522)
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 16818)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- TOC entry 4951 (class 2606 OID 16806)
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 2606 OID 16999)
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- TOC entry 4945 (class 2606 OID 16793)
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- TOC entry 4979 (class 2606 OID 16984)
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4900 (class 2606 OID 16512)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4903 (class 2606 OID 16736)
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4964 (class 2606 OID 16865)
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- TOC entry 4966 (class 2606 OID 16863)
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 16879)
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- TOC entry 4911 (class 2606 OID 16535)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4938 (class 2606 OID 16757)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4961 (class 2606 OID 16846)
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- TOC entry 4957 (class 2606 OID 16837)
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4893 (class 2606 OID 16919)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 4895 (class 2606 OID 16499)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5015 (class 2606 OID 18580)
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- TOC entry 5017 (class 2606 OID 18578)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 5019 (class 2606 OID 18582)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 5045 (class 2606 OID 18733)
-- Name: daily_sales_summary daily_sales_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sales_summary
    ADD CONSTRAINT daily_sales_summary_pkey PRIMARY KEY (id);


--
-- TOC entry 5055 (class 2606 OID 18791)
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 5069 (class 2606 OID 18891)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5043 (class 2606 OID 18705)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5052 (class 2606 OID 18769)
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- TOC entry 5038 (class 2606 OID 18683)
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- TOC entry 5040 (class 2606 OID 18681)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 5049 (class 2606 OID 18750)
-- Name: product_sales_summary product_sales_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_sales_summary
    ADD CONSTRAINT product_sales_summary_pkey PRIMARY KEY (id);


--
-- TOC entry 5095 (class 2606 OID 19387)
-- Name: product_wishlists product_wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_wishlists
    ADD CONSTRAINT product_wishlists_pkey PRIMARY KEY (id);


--
-- TOC entry 5097 (class 2606 OID 19389)
-- Name: product_wishlists product_wishlists_product_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_wishlists
    ADD CONSTRAINT product_wishlists_product_id_user_id_key UNIQUE (product_id, user_id);


--
-- TOC entry 5023 (class 2606 OID 18606)
-- Name: products products_barcode_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key UNIQUE (barcode);


--
-- TOC entry 5025 (class 2606 OID 18604)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 5013 (class 2606 OID 18566)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 5064 (class 2606 OID 18871)
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);


--
-- TOC entry 5066 (class 2606 OID 18873)
-- Name: shipments shipments_shipment_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_shipment_number_key UNIQUE (shipment_number);


--
-- TOC entry 5031 (class 2606 OID 18648)
-- Name: store_products store_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_products
    ADD CONSTRAINT store_products_pkey PRIMARY KEY (id);


--
-- TOC entry 5028 (class 2606 OID 18628)
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- TOC entry 5062 (class 2606 OID 18849)
-- Name: supply_request_items supply_request_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_request_items
    ADD CONSTRAINT supply_request_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5058 (class 2606 OID 18817)
-- Name: supply_requests supply_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_requests
    ADD CONSTRAINT supply_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 5060 (class 2606 OID 18819)
-- Name: supply_requests supply_requests_request_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_requests
    ADD CONSTRAINT supply_requests_request_number_key UNIQUE (request_number);


--
-- TOC entry 5071 (class 2606 OID 18910)
-- Name: system_settings system_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_key_key UNIQUE (key);


--
-- TOC entry 5073 (class 2606 OID 18908)
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5091 (class 2606 OID 19292)
-- Name: wishlists wishlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_pkey PRIMARY KEY (id);


--
-- TOC entry 5093 (class 2606 OID 19294)
-- Name: wishlists wishlists_user_product_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_product_unique UNIQUE (user_id, product_id);


--
-- TOC entry 4995 (class 2606 OID 17266)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 5075 (class 2606 OID 19099)
-- Name: messages_2025_08_06 messages_2025_08_06_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_06
    ADD CONSTRAINT messages_2025_08_06_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 5077 (class 2606 OID 19110)
-- Name: messages_2025_08_07 messages_2025_08_07_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_07
    ADD CONSTRAINT messages_2025_08_07_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 5079 (class 2606 OID 19121)
-- Name: messages_2025_08_08 messages_2025_08_08_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_08
    ADD CONSTRAINT messages_2025_08_08_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 5081 (class 2606 OID 19132)
-- Name: messages_2025_08_09 messages_2025_08_09_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_09
    ADD CONSTRAINT messages_2025_08_09_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 5083 (class 2606 OID 19143)
-- Name: messages_2025_08_10 messages_2025_08_10_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_08_10
    ADD CONSTRAINT messages_2025_08_10_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4987 (class 2606 OID 17041)
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- TOC entry 4984 (class 2606 OID 17004)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 5000 (class 2606 OID 17324)
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 4914 (class 2606 OID 16552)
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- TOC entry 4924 (class 2606 OID 16593)
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- TOC entry 4926 (class 2606 OID 16591)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4922 (class 2606 OID 16569)
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- TOC entry 4998 (class 2606 OID 17278)
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- TOC entry 4993 (class 2606 OID 17090)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- TOC entry 4991 (class 2606 OID 17075)
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- TOC entry 5085 (class 2606 OID 19193)
-- Name: schema_migrations schema_migrations_idempotency_key_key; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);


--
-- TOC entry 5087 (class 2606 OID 19178)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 5089 (class 2606 OID 19185)
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- TOC entry 4909 (class 1259 OID 16530)
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- TOC entry 4883 (class 1259 OID 16746)
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4884 (class 1259 OID 16748)
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4885 (class 1259 OID 16749)
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4941 (class 1259 OID 16827)
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- TOC entry 4973 (class 1259 OID 16935)
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- TOC entry 4930 (class 1259 OID 16915)
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- TOC entry 5516 (class 0 OID 0)
-- Dependencies: 4930
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- TOC entry 4935 (class 1259 OID 16743)
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- TOC entry 4976 (class 1259 OID 16932)
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- TOC entry 4977 (class 1259 OID 16933)
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- TOC entry 4949 (class 1259 OID 16938)
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- TOC entry 4946 (class 1259 OID 16799)
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- TOC entry 4947 (class 1259 OID 16944)
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- TOC entry 4980 (class 1259 OID 16991)
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- TOC entry 4981 (class 1259 OID 16990)
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- TOC entry 4982 (class 1259 OID 16992)
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- TOC entry 4886 (class 1259 OID 16750)
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4887 (class 1259 OID 16747)
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4896 (class 1259 OID 16513)
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- TOC entry 4897 (class 1259 OID 16514)
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- TOC entry 4898 (class 1259 OID 16742)
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- TOC entry 4901 (class 1259 OID 16829)
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- TOC entry 4904 (class 1259 OID 16934)
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- TOC entry 4967 (class 1259 OID 16871)
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- TOC entry 4968 (class 1259 OID 16936)
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- TOC entry 4969 (class 1259 OID 16886)
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- TOC entry 4972 (class 1259 OID 16885)
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- TOC entry 4936 (class 1259 OID 16937)
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- TOC entry 4939 (class 1259 OID 16828)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- TOC entry 4959 (class 1259 OID 16853)
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- TOC entry 4962 (class 1259 OID 16852)
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- TOC entry 4958 (class 1259 OID 16838)
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- TOC entry 4948 (class 1259 OID 16997)
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- TOC entry 4940 (class 1259 OID 16826)
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- TOC entry 4888 (class 1259 OID 16906)
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- TOC entry 5517 (class 0 OID 0)
-- Dependencies: 4888
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- TOC entry 4889 (class 1259 OID 16744)
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- TOC entry 4890 (class 1259 OID 16503)
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- TOC entry 4891 (class 1259 OID 16961)
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- TOC entry 5020 (class 1259 OID 18912)
-- Name: idx_categories_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_categories_parent_id ON public.categories USING btree (parent_id);


--
-- TOC entry 5046 (class 1259 OID 18920)
-- Name: idx_daily_sales_summary_store_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_sales_summary_store_date ON public.daily_sales_summary USING btree (store_id, date);


--
-- TOC entry 5053 (class 1259 OID 18923)
-- Name: idx_inventory_transactions_store_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_transactions_store_product_id ON public.inventory_transactions USING btree (store_product_id);


--
-- TOC entry 5067 (class 1259 OID 18925)
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- TOC entry 5041 (class 1259 OID 18919)
-- Name: idx_order_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);


--
-- TOC entry 5050 (class 1259 OID 18922)
-- Name: idx_order_status_history_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_status_history_order_id ON public.order_status_history USING btree (order_id);


--
-- TOC entry 5032 (class 1259 OID 18927)
-- Name: idx_orders_customer_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_customer_created ON public.orders USING btree (customer_id, created_at);


--
-- TOC entry 5033 (class 1259 OID 18916)
-- Name: idx_orders_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_customer_id ON public.orders USING btree (customer_id);


--
-- TOC entry 5034 (class 1259 OID 18926)
-- Name: idx_orders_payment_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_payment_key ON public.orders USING btree (((payment_data ->> 'paymentKey'::text)));


--
-- TOC entry 5035 (class 1259 OID 18918)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- TOC entry 5036 (class 1259 OID 18917)
-- Name: idx_orders_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_store_id ON public.orders USING btree (store_id);


--
-- TOC entry 5047 (class 1259 OID 18921)
-- Name: idx_product_sales_summary_store_product_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_sales_summary_store_product_date ON public.product_sales_summary USING btree (store_id, product_id, date);


--
-- TOC entry 5021 (class 1259 OID 18913)
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);


--
-- TOC entry 5011 (class 1259 OID 18911)
-- Name: idx_profiles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);


--
-- TOC entry 5029 (class 1259 OID 18915)
-- Name: idx_store_products_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_store_products_store_id ON public.store_products USING btree (store_id);


--
-- TOC entry 5026 (class 1259 OID 18914)
-- Name: idx_stores_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stores_owner_id ON public.stores USING btree (owner_id);


--
-- TOC entry 5056 (class 1259 OID 18924)
-- Name: idx_supply_requests_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supply_requests_store_id ON public.supply_requests USING btree (store_id);


--
-- TOC entry 4985 (class 1259 OID 17267)
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- TOC entry 4988 (class 1259 OID 17164)
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- TOC entry 4912 (class 1259 OID 16558)
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- TOC entry 4915 (class 1259 OID 16580)
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- TOC entry 4989 (class 1259 OID 17101)
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- TOC entry 4916 (class 1259 OID 17296)
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- TOC entry 4917 (class 1259 OID 17066)
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- TOC entry 4918 (class 1259 OID 17298)
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- TOC entry 4996 (class 1259 OID 17299)
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- TOC entry 4919 (class 1259 OID 16581)
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- TOC entry 4920 (class 1259 OID 17297)
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- TOC entry 5098 (class 0 OID 0)
-- Name: messages_2025_08_06_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_06_pkey;


--
-- TOC entry 5099 (class 0 OID 0)
-- Name: messages_2025_08_07_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_07_pkey;


--
-- TOC entry 5100 (class 0 OID 0)
-- Name: messages_2025_08_08_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_08_pkey;


--
-- TOC entry 5101 (class 0 OID 0)
-- Name: messages_2025_08_09_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_09_pkey;


--
-- TOC entry 5102 (class 0 OID 0)
-- Name: messages_2025_08_10_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_08_10_pkey;


--
-- TOC entry 5156 (class 2620 OID 18955)
-- Name: orders log_order_status_change_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER log_order_status_change_trigger AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();


--
-- TOC entry 5157 (class 2620 OID 18952)
-- Name: orders set_order_number_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_order_number_trigger BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();


--
-- TOC entry 5164 (class 2620 OID 18954)
-- Name: shipments set_shipment_number_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_shipment_number_trigger BEFORE INSERT ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.generate_shipment_number();


--
-- TOC entry 5162 (class 2620 OID 18953)
-- Name: supply_requests set_supply_request_number_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_supply_request_number_trigger BEFORE INSERT ON public.supply_requests FOR EACH ROW EXECUTE FUNCTION public.generate_supply_request_number();


--
-- TOC entry 5154 (class 2620 OID 18956)
-- Name: stores trigger_initialize_store_products; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_initialize_store_products AFTER INSERT ON public.stores FOR EACH ROW EXECUTE FUNCTION public.initialize_store_products();


--
-- TOC entry 5155 (class 2620 OID 18957)
-- Name: store_products trigger_low_stock_check; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_low_stock_check AFTER UPDATE ON public.store_products FOR EACH ROW EXECUTE FUNCTION public.check_low_stock();


--
-- TOC entry 5158 (class 2620 OID 18958)
-- Name: orders trigger_order_completion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_order_completion AFTER UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_order_completion();


--
-- TOC entry 5159 (class 2620 OID 18962)
-- Name: orders trigger_prevent_duplicate_orders; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_prevent_duplicate_orders BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_orders();


--
-- TOC entry 5165 (class 2620 OID 18959)
-- Name: shipments trigger_shipment_delivery; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_shipment_delivery AFTER UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.handle_shipment_delivery();


--
-- TOC entry 5163 (class 2620 OID 18960)
-- Name: supply_requests trigger_update_inventory_on_supply_delivery; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_inventory_on_supply_delivery AFTER UPDATE ON public.supply_requests FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_supply_delivery();


--
-- TOC entry 5160 (class 2620 OID 18963)
-- Name: orders trigger_validate_order_service; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_validate_order_service BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.validate_order_service();


--
-- TOC entry 5161 (class 2620 OID 18961)
-- Name: inventory_transactions update_store_product_stock_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_store_product_stock_trigger AFTER INSERT ON public.inventory_transactions FOR EACH ROW EXECUTE FUNCTION public.update_store_product_stock();


--
-- TOC entry 5151 (class 2620 OID 17120)
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- TOC entry 5146 (class 2620 OID 17306)
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- TOC entry 5147 (class 2620 OID 17294)
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 5148 (class 2620 OID 17292)
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- TOC entry 5149 (class 2620 OID 17293)
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- TOC entry 5152 (class 2620 OID 17302)
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- TOC entry 5153 (class 2620 OID 17291)
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 5150 (class 2620 OID 17054)
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- TOC entry 5105 (class 2606 OID 16730)
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5109 (class 2606 OID 16819)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 5108 (class 2606 OID 16807)
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- TOC entry 5107 (class 2606 OID 16794)
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5114 (class 2606 OID 16985)
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5103 (class 2606 OID 16763)
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 5111 (class 2606 OID 16866)
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 5112 (class 2606 OID 16939)
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- TOC entry 5113 (class 2606 OID 16880)
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 5106 (class 2606 OID 16758)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5110 (class 2606 OID 16847)
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 5119 (class 2606 OID 18583)
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- TOC entry 5128 (class 2606 OID 18734)
-- Name: daily_sales_summary daily_sales_summary_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_sales_summary
    ADD CONSTRAINT daily_sales_summary_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- TOC entry 5133 (class 2606 OID 18797)
-- Name: inventory_transactions inventory_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5134 (class 2606 OID 18792)
-- Name: inventory_transactions inventory_transactions_store_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_store_product_id_fkey FOREIGN KEY (store_product_id) REFERENCES public.store_products(id);


--
-- TOC entry 5141 (class 2606 OID 18892)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);


--
-- TOC entry 5126 (class 2606 OID 18706)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5127 (class 2606 OID 18711)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 5131 (class 2606 OID 18775)
-- Name: order_status_history order_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.profiles(id);


--
-- TOC entry 5132 (class 2606 OID 18770)
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 5124 (class 2606 OID 18684)
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.profiles(id);


--
-- TOC entry 5125 (class 2606 OID 18689)
-- Name: orders orders_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- TOC entry 5129 (class 2606 OID 18756)
-- Name: product_sales_summary product_sales_summary_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_sales_summary
    ADD CONSTRAINT product_sales_summary_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 5130 (class 2606 OID 18751)
-- Name: product_sales_summary product_sales_summary_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_sales_summary
    ADD CONSTRAINT product_sales_summary_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- TOC entry 5144 (class 2606 OID 19390)
-- Name: product_wishlists product_wishlists_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_wishlists
    ADD CONSTRAINT product_wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 5145 (class 2606 OID 19395)
-- Name: product_wishlists product_wishlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_wishlists
    ADD CONSTRAINT product_wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5120 (class 2606 OID 18607)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- TOC entry 5140 (class 2606 OID 18874)
-- Name: shipments shipments_supply_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_supply_request_id_fkey FOREIGN KEY (supply_request_id) REFERENCES public.supply_requests(id);


--
-- TOC entry 5122 (class 2606 OID 18654)
-- Name: store_products store_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_products
    ADD CONSTRAINT store_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 5123 (class 2606 OID 18649)
-- Name: store_products store_products_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.store_products
    ADD CONSTRAINT store_products_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- TOC entry 5121 (class 2606 OID 18629)
-- Name: stores stores_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id);


--
-- TOC entry 5138 (class 2606 OID 18855)
-- Name: supply_request_items supply_request_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_request_items
    ADD CONSTRAINT supply_request_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 5139 (class 2606 OID 18850)
-- Name: supply_request_items supply_request_items_supply_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_request_items
    ADD CONSTRAINT supply_request_items_supply_request_id_fkey FOREIGN KEY (supply_request_id) REFERENCES public.supply_requests(id);


--
-- TOC entry 5135 (class 2606 OID 18830)
-- Name: supply_requests supply_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_requests
    ADD CONSTRAINT supply_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id);


--
-- TOC entry 5136 (class 2606 OID 18825)
-- Name: supply_requests supply_requests_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_requests
    ADD CONSTRAINT supply_requests_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.profiles(id);


--
-- TOC entry 5137 (class 2606 OID 18820)
-- Name: supply_requests supply_requests_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supply_requests
    ADD CONSTRAINT supply_requests_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- TOC entry 5142 (class 2606 OID 19300)
-- Name: wishlists wishlists_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 5143 (class 2606 OID 19295)
-- Name: wishlists wishlists_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wishlists
    ADD CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5104 (class 2606 OID 16570)
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 5118 (class 2606 OID 17279)
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 5115 (class 2606 OID 17076)
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 5116 (class 2606 OID 17096)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 5117 (class 2606 OID 17091)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- TOC entry 5327 (class 0 OID 16523)
-- Dependencies: 254
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5341 (class 0 OID 16925)
-- Dependencies: 271
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5332 (class 0 OID 16723)
-- Dependencies: 262
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5326 (class 0 OID 16516)
-- Dependencies: 253
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5336 (class 0 OID 16812)
-- Dependencies: 266
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5335 (class 0 OID 16800)
-- Dependencies: 265
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5334 (class 0 OID 16787)
-- Dependencies: 264
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5342 (class 0 OID 16975)
-- Dependencies: 272
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5325 (class 0 OID 16505)
-- Dependencies: 252
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5339 (class 0 OID 16854)
-- Dependencies: 269
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5340 (class 0 OID 16872)
-- Dependencies: 270
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5328 (class 0 OID 16531)
-- Dependencies: 255
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5333 (class 0 OID 16753)
-- Dependencies: 263
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5338 (class 0 OID 16839)
-- Dependencies: 268
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5337 (class 0 OID 16830)
-- Dependencies: 267
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5324 (class 0 OID 16493)
-- Dependencies: 250
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5405 (class 3256 OID 19006)
-- Name: notifications Allow creating notifications for users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow creating notifications for users" ON public.notifications FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM (public.orders o
     JOIN public.stores s ON ((s.id = o.store_id)))
  WHERE ((o.customer_id = notifications.user_id) AND (s.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'headquarters'::text)))) OR (auth.uid() IS NULL)));


--
-- TOC entry 5373 (class 3256 OID 18971)
-- Name: stores Anyone can view active stores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active stores" ON public.stores FOR SELECT USING ((is_active = true));


--
-- TOC entry 5369 (class 3256 OID 18967)
-- Name: categories Anyone can view categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);


--
-- TOC entry 5371 (class 3256 OID 18969)
-- Name: products Anyone can view products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);


--
-- TOC entry 5406 (class 3256 OID 19008)
-- Name: system_settings Anyone can view public settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view public settings" ON public.system_settings FOR SELECT USING ((is_public = true));


--
-- TOC entry 5397 (class 3256 OID 18997)
-- Name: inventory_transactions Customers can create inventory transactions for own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers can create inventory transactions for own orders" ON public.inventory_transactions FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = inventory_transactions.reference_id) AND (o.customer_id = auth.uid()) AND (inventory_transactions.reference_type = 'order'::text)))));


--
-- TOC entry 5387 (class 3256 OID 18984)
-- Name: order_items Customers can create order items for own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers can create order items for own orders" ON public.order_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_items.order_id) AND (o.customer_id = auth.uid())))));


--
-- TOC entry 5376 (class 3256 OID 18979)
-- Name: orders Customers can create own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers can create own orders" ON public.orders FOR INSERT WITH CHECK ((customer_id = auth.uid()));


--
-- TOC entry 5388 (class 3256 OID 18985)
-- Name: order_items Customers can delete own order items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers can delete own order items" ON public.order_items FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_items.order_id) AND (o.customer_id = auth.uid())))));


--
-- TOC entry 5384 (class 3256 OID 18981)
-- Name: orders Customers can delete own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers can delete own orders" ON public.orders FOR DELETE USING ((customer_id = auth.uid()));


--
-- TOC entry 5380 (class 3256 OID 18976)
-- Name: store_products Customers can view available store products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers can view available store products" ON public.store_products FOR SELECT USING (((is_available = true) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'customer'::text))))));


--
-- TOC entry 5377 (class 3256 OID 18980)
-- Name: orders Customers can view own orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Customers can view own orders" ON public.orders FOR SELECT USING ((customer_id = auth.uid()));


--
-- TOC entry 5396 (class 3256 OID 18996)
-- Name: inventory_transactions HQ can manage all inventory transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "HQ can manage all inventory transactions" ON public.inventory_transactions USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'headquarters'::text)))));


--
-- TOC entry 5407 (class 3256 OID 19009)
-- Name: system_settings HQ can manage all settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "HQ can manage all settings" ON public.system_settings USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'headquarters'::text)))));


--
-- TOC entry 5382 (class 3256 OID 18978)
-- Name: store_products HQ can manage all store products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "HQ can manage all store products" ON public.store_products USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'headquarters'::text)))));


--
-- TOC entry 5379 (class 3256 OID 18975)
-- Name: stores HQ can manage all stores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "HQ can manage all stores" ON public.stores USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'headquarters'::text)))));


--
-- TOC entry 5399 (class 3256 OID 18999)
-- Name: supply_requests HQ can manage all supply requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "HQ can manage all supply requests" ON public.supply_requests USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'headquarters'::text)))));


--
-- TOC entry 5386 (class 3256 OID 18983)
-- Name: orders HQ can view all orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "HQ can view all orders" ON public.orders FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'headquarters'::text)))));


--
-- TOC entry 5393 (class 3256 OID 18990)
-- Name: product_sales_summary HQ can view all product sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "HQ can view all product sales" ON public.product_sales_summary FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'headquarters'::text)))));


--
-- TOC entry 5391 (class 3256 OID 18988)
-- Name: daily_sales_summary HQ can view all sales summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "HQ can view all sales summary" ON public.daily_sales_summary FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'headquarters'::text)))));


--
-- TOC entry 5370 (class 3256 OID 18968)
-- Name: categories Only HQ can manage categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only HQ can manage categories" ON public.categories USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'headquarters'::text)))));


--
-- TOC entry 5372 (class 3256 OID 18970)
-- Name: products Only HQ can manage products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only HQ can manage products" ON public.products USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'headquarters'::text)))));


--
-- TOC entry 5402 (class 3256 OID 19003)
-- Name: shipments Only HQ can manage shipments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only HQ can manage shipments" ON public.shipments USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'headquarters'::text)))));


--
-- TOC entry 5383 (class 3256 OID 18991)
-- Name: order_status_history Store owners can create order status history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can create order status history" ON public.order_status_history FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM (public.orders o
     JOIN public.stores s ON ((s.id = o.store_id)))
  WHERE ((o.id = order_status_history.order_id) AND (s.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'headquarters'::text))))));


--
-- TOC entry 5374 (class 3256 OID 18972)
-- Name: stores Store owners can create own store; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can create own store" ON public.stores FOR INSERT WITH CHECK ((auth.uid() = owner_id));


--
-- TOC entry 5395 (class 3256 OID 18994)
-- Name: inventory_transactions Store owners can manage own inventory transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage own inventory transactions" ON public.inventory_transactions USING ((EXISTS ( SELECT 1
   FROM (public.store_products sp
     JOIN public.stores s ON ((s.id = sp.store_id)))
  WHERE ((sp.id = inventory_transactions.store_product_id) AND (s.owner_id = auth.uid())))));


--
-- TOC entry 5381 (class 3256 OID 18977)
-- Name: store_products Store owners can manage own store products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage own store products" ON public.store_products USING ((store_id IN ( SELECT stores.id
   FROM public.stores
  WHERE (stores.owner_id = auth.uid()))));


--
-- TOC entry 5398 (class 3256 OID 18998)
-- Name: supply_requests Store owners can manage own supply requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage own supply requests" ON public.supply_requests USING ((EXISTS ( SELECT 1
   FROM public.stores s
  WHERE ((s.id = supply_requests.store_id) AND (s.owner_id = auth.uid())))));


--
-- TOC entry 5385 (class 3256 OID 18982)
-- Name: orders Store owners can manage store orders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can manage store orders" ON public.orders USING ((EXISTS ( SELECT 1
   FROM public.stores s
  WHERE ((s.id = orders.store_id) AND (s.owner_id = auth.uid())))));


--
-- TOC entry 5375 (class 3256 OID 18973)
-- Name: stores Store owners can update own store; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can update own store" ON public.stores FOR UPDATE USING ((owner_id = auth.uid()));


--
-- TOC entry 5392 (class 3256 OID 18989)
-- Name: product_sales_summary Store owners can view own product sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can view own product sales" ON public.product_sales_summary FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.stores s
  WHERE ((s.id = product_sales_summary.store_id) AND (s.owner_id = auth.uid())))));


--
-- TOC entry 5390 (class 3256 OID 18987)
-- Name: daily_sales_summary Store owners can view own sales summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can view own sales summary" ON public.daily_sales_summary FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.stores s
  WHERE ((s.id = daily_sales_summary.store_id) AND (s.owner_id = auth.uid())))));


--
-- TOC entry 5401 (class 3256 OID 19001)
-- Name: shipments Store owners can view own shipments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can view own shipments" ON public.shipments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM (public.supply_requests sr
     JOIN public.stores s ON ((s.id = sr.store_id)))
  WHERE ((sr.id = shipments.supply_request_id) AND (s.owner_id = auth.uid())))));


--
-- TOC entry 5378 (class 3256 OID 18974)
-- Name: stores Store owners can view own store; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Store owners can view own store" ON public.stores FOR SELECT USING (((owner_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['headquarters'::text, 'customer'::text])))))));


--
-- TOC entry 5409 (class 3256 OID 19306)
-- Name: wishlists Users can create their own wishlists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own wishlists" ON public.wishlists FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- TOC entry 5410 (class 3256 OID 19307)
-- Name: wishlists Users can delete their own wishlists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own wishlists" ON public.wishlists FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- TOC entry 5366 (class 3256 OID 18964)
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- TOC entry 5400 (class 3256 OID 19000)
-- Name: supply_request_items Users can manage supply request items based on request access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage supply request items based on request access" ON public.supply_request_items USING ((EXISTS ( SELECT 1
   FROM public.supply_requests sr
  WHERE ((sr.id = supply_request_items.supply_request_id) AND ((EXISTS ( SELECT 1
           FROM public.stores s
          WHERE ((s.id = sr.store_id) AND (s.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1
           FROM public.profiles p
          WHERE ((p.id = auth.uid()) AND (p.role = 'headquarters'::text)))))))));


--
-- TOC entry 5404 (class 3256 OID 19005)
-- Name: notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING ((user_id = auth.uid()));


--
-- TOC entry 5367 (class 3256 OID 18965)
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- TOC entry 5389 (class 3256 OID 18986)
-- Name: order_items Users can view order items based on order access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view order items based on order access" ON public.order_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_items.order_id) AND ((o.customer_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM public.stores s
          WHERE ((s.id = o.store_id) AND (s.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1
           FROM public.profiles p
          WHERE ((p.id = auth.uid()) AND (p.role = 'headquarters'::text)))))))));


--
-- TOC entry 5394 (class 3256 OID 18993)
-- Name: order_status_history Users can view order status history based on order access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view order status history based on order access" ON public.order_status_history FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.orders o
  WHERE ((o.id = order_status_history.order_id) AND ((o.customer_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM public.stores s
          WHERE ((s.id = o.store_id) AND (s.owner_id = auth.uid())))) OR (EXISTS ( SELECT 1
           FROM public.profiles p
          WHERE ((p.id = auth.uid()) AND (p.role = 'headquarters'::text)))))))));


--
-- TOC entry 5403 (class 3256 OID 19004)
-- Name: notifications Users can view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING ((user_id = auth.uid()));


--
-- TOC entry 5368 (class 3256 OID 18966)
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- TOC entry 5408 (class 3256 OID 19305)
-- Name: wishlists Users can view their own wishlists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own wishlists" ON public.wishlists FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- TOC entry 5349 (class 0 OID 18567)
-- Dependencies: 296
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5355 (class 0 OID 18716)
-- Dependencies: 302
-- Name: daily_sales_summary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_sales_summary ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5358 (class 0 OID 18780)
-- Dependencies: 305
-- Name: inventory_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5362 (class 0 OID 18879)
-- Dependencies: 309
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5354 (class 0 OID 18694)
-- Dependencies: 301
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5357 (class 0 OID 18761)
-- Dependencies: 304
-- Name: order_status_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5353 (class 0 OID 18659)
-- Dependencies: 300
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5356 (class 0 OID 18739)
-- Dependencies: 303
-- Name: product_sales_summary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_sales_summary ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5365 (class 0 OID 19381)
-- Dependencies: 324
-- Name: product_wishlists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.product_wishlists ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5350 (class 0 OID 18588)
-- Dependencies: 297
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5348 (class 0 OID 18555)
-- Dependencies: 295
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5361 (class 0 OID 18860)
-- Dependencies: 308
-- Name: shipments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5352 (class 0 OID 18634)
-- Dependencies: 299
-- Name: store_products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5351 (class 0 OID 18612)
-- Dependencies: 298
-- Name: stores; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5360 (class 0 OID 18835)
-- Dependencies: 307
-- Name: supply_request_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.supply_request_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5359 (class 0 OID 18802)
-- Dependencies: 306
-- Name: supply_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.supply_requests ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5363 (class 0 OID 18897)
-- Dependencies: 310
-- Name: system_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5364 (class 0 OID 19286)
-- Dependencies: 323
-- Name: wishlists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5411 (class 3256 OID 19400)
-- Name: product_wishlists 사용자는 자신의 찜 목록만 볼 수 있음; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "사용자는 자신의 찜 목록만 볼 수 있음" ON public.product_wishlists FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- TOC entry 5415 (class 3256 OID 19404)
-- Name: wishlists 사용자는 자신의 찜 목록만 삭제 가능; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "사용자는 자신의 찜 목록만 삭제 가능" ON public.wishlists FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- TOC entry 5413 (class 3256 OID 19402)
-- Name: wishlists 사용자는 자신의 찜 목록만 조회 가능; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "사용자는 자신의 찜 목록만 조회 가능" ON public.wishlists FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- TOC entry 5414 (class 3256 OID 19403)
-- Name: wishlists 사용자는 자신의 찜 목록만 추가 가능; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "사용자는 자신의 찜 목록만 추가 가능" ON public.wishlists FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- TOC entry 5412 (class 3256 OID 19401)
-- Name: product_wishlists 사용자는 찜하기/취소만 할 수 있음; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "사용자는 찜하기/취소만 할 수 있음" ON public.product_wishlists TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- TOC entry 5345 (class 0 OID 17251)
-- Dependencies: 281
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5329 (class 0 OID 16544)
-- Dependencies: 256
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5347 (class 0 OID 17314)
-- Dependencies: 283
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5331 (class 0 OID 16586)
-- Dependencies: 258
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5330 (class 0 OID 16559)
-- Dependencies: 257
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5346 (class 0 OID 17269)
-- Dependencies: 282
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5343 (class 0 OID 17067)
-- Dependencies: 277
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5344 (class 0 OID 17081)
-- Dependencies: 278
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5416 (class 6104 OID 16426)
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- TOC entry 5417 (class 6104 OID 19146)
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- TOC entry 5418 (class 6106 OID 19147)
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- TOC entry 4663 (class 3466 OID 16619)
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- TOC entry 4668 (class 3466 OID 16698)
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- TOC entry 4662 (class 3466 OID 16617)
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- TOC entry 4669 (class 3466 OID 16701)
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- TOC entry 4664 (class 3466 OID 16620)
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- TOC entry 4665 (class 3466 OID 16621)
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


-- Completed on 2025-08-08 12:33:01 KST

--
-- PostgreSQL database dump complete
--

