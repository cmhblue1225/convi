SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") FROM stdin;
00000000-0000-0000-0000-000000000000	ca1ecd9f-9047-4621-93df-37b087b9a4df	{"action":"user_signedup","actor_id":"3a40a11e-6a63-4259-b387-a33948e9d91a","actor_name":"테스트 점주1","actor_username":"customer1@test.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-07 08:38:10.995929+00	
00000000-0000-0000-0000-000000000000	e7b1e2b6-d401-4c13-8de4-0929b41f1e86	{"action":"login","actor_id":"3a40a11e-6a63-4259-b387-a33948e9d91a","actor_name":"테스트 점주1","actor_username":"customer1@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-07 08:38:11.006481+00	
00000000-0000-0000-0000-000000000000	25a09bb1-9db7-4f90-927f-1fa3f4e970c6	{"action":"logout","actor_id":"3a40a11e-6a63-4259-b387-a33948e9d91a","actor_name":"테스트 점주1","actor_username":"customer1@test.com","actor_via_sso":false,"log_type":"account"}	2025-08-07 08:38:14.533878+00	
00000000-0000-0000-0000-000000000000	25735d3a-5f8c-4ab5-8421-2b6453f8a735	{"action":"user_signedup","actor_id":"49761aab-c140-4ec0-8792-ff716f69ff07","actor_name":"테스트 고객2","actor_username":"customer2@test.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-07 08:38:30.965666+00	
00000000-0000-0000-0000-000000000000	da110fdd-851d-4d83-9a93-80300adc3050	{"action":"login","actor_id":"49761aab-c140-4ec0-8792-ff716f69ff07","actor_name":"테스트 고객2","actor_username":"customer2@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-07 08:38:30.968962+00	
00000000-0000-0000-0000-000000000000	03a47611-ad19-42a2-951d-d938d430a7e7	{"action":"logout","actor_id":"49761aab-c140-4ec0-8792-ff716f69ff07","actor_name":"테스트 고객2","actor_username":"customer2@test.com","actor_via_sso":false,"log_type":"account"}	2025-08-07 08:38:40.700907+00	
00000000-0000-0000-0000-000000000000	a0b01e9c-d6bd-4267-a6c5-a75eea7717ce	{"action":"user_signedup","actor_id":"4de5a99f-c920-476e-b742-57a467e0fc62","actor_name":"테스트 점주1","actor_username":"shopowner1@test.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-07 08:39:07.169738+00	
00000000-0000-0000-0000-000000000000	25587514-42ef-46a5-858c-8d73b4ce4b1f	{"action":"login","actor_id":"4de5a99f-c920-476e-b742-57a467e0fc62","actor_name":"테스트 점주1","actor_username":"shopowner1@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-07 08:39:07.173053+00	
00000000-0000-0000-0000-000000000000	b4ffeb49-191c-4eb4-8b99-706eb35c9bc9	{"action":"logout","actor_id":"4de5a99f-c920-476e-b742-57a467e0fc62","actor_name":"테스트 점주1","actor_username":"shopowner1@test.com","actor_via_sso":false,"log_type":"account"}	2025-08-07 08:39:10.261742+00	
00000000-0000-0000-0000-000000000000	15275225-225b-428c-b5b1-4e2610a08d93	{"action":"user_signedup","actor_id":"b03e3bb0-3d16-4c75-a0f1-cffc793b0441","actor_name":"테스트 점주2","actor_username":"shopowner2@test.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-07 08:39:32.550665+00	
00000000-0000-0000-0000-000000000000	a54d4c01-b609-4442-ab53-8d95474659f3	{"action":"login","actor_id":"b03e3bb0-3d16-4c75-a0f1-cffc793b0441","actor_name":"테스트 점주2","actor_username":"shopowner2@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-07 08:39:32.553711+00	
00000000-0000-0000-0000-000000000000	f764a0d9-5ee0-41bd-b11c-cf386fe4bf0e	{"action":"logout","actor_id":"b03e3bb0-3d16-4c75-a0f1-cffc793b0441","actor_name":"테스트 점주2","actor_username":"shopowner2@test.com","actor_via_sso":false,"log_type":"account"}	2025-08-07 08:39:35.445579+00	
00000000-0000-0000-0000-000000000000	3a339282-60fb-43e4-a351-2dd3bc9aa8eb	{"action":"user_signedup","actor_id":"c907860e-e21c-4a99-94a8-15fd5295878d","actor_name":"테스트 본사","actor_username":"hq@test.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-08-07 08:39:49.361247+00	
00000000-0000-0000-0000-000000000000	ed6d8606-144f-401a-a237-cfc0ff8cea23	{"action":"login","actor_id":"c907860e-e21c-4a99-94a8-15fd5295878d","actor_name":"테스트 본사","actor_username":"hq@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-07 08:39:49.365217+00	
00000000-0000-0000-0000-000000000000	3a8b4d7a-248b-4d5a-bc3e-2b1a955db445	{"action":"logout","actor_id":"c907860e-e21c-4a99-94a8-15fd5295878d","actor_name":"테스트 본사","actor_username":"hq@test.com","actor_via_sso":false,"log_type":"account"}	2025-08-07 08:41:02.061632+00	
00000000-0000-0000-0000-000000000000	453b2cd6-4e64-4dd3-9a46-c1d183ba74dc	{"action":"login","actor_id":"3a40a11e-6a63-4259-b387-a33948e9d91a","actor_name":"테스트 점주1","actor_username":"customer1@test.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-08-07 08:41:12.416301+00	
00000000-0000-0000-0000-000000000000	6ff62612-685b-4964-bd1c-255f0856ef11	{"action":"token_refreshed","actor_id":"3a40a11e-6a63-4259-b387-a33948e9d91a","actor_name":"테스트 점주1","actor_username":"customer1@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 23:44:04.176101+00	
00000000-0000-0000-0000-000000000000	2190b041-97f4-43bb-b5a6-421b8d5833dc	{"action":"token_revoked","actor_id":"3a40a11e-6a63-4259-b387-a33948e9d91a","actor_name":"테스트 점주1","actor_username":"customer1@test.com","actor_via_sso":false,"log_type":"token"}	2025-08-07 23:44:04.18378+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") FROM stdin;
00000000-0000-0000-0000-000000000000	b03e3bb0-3d16-4c75-a0f1-cffc793b0441	authenticated	authenticated	shopowner2@test.com	$2a$10$a0mjt/XcP.v7aRjTlFgq6e8TEExXQrG08rUL7apesxMHfmLRqS1nW	2025-08-07 08:39:32.551161+00	\N		\N		\N			\N	2025-08-07 08:39:32.554225+00	{"provider": "email", "providers": ["email"]}	{"sub": "b03e3bb0-3d16-4c75-a0f1-cffc793b0441", "role": "store_owner", "email": "shopowner2@test.com", "full_name": "테스트 점주2", "last_name": "점주2", "storeName": "테스트 편의점2", "first_name": "테스트", "storePhone": "02-2222-2222", "storeAddress": "솔샘로 174", "email_verified": true, "phone_verified": false}	\N	2025-08-07 08:39:32.546366+00	2025-08-07 08:39:32.555914+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4de5a99f-c920-476e-b742-57a467e0fc62	authenticated	authenticated	shopowner1@test.com	$2a$10$Rqzns1MaU5bLxY1G44LcD.xmIqh9ezib8x4csH4inS2NVEbYwb3Om	2025-08-07 08:39:07.170263+00	\N		\N		\N			\N	2025-08-07 08:39:07.173611+00	{"provider": "email", "providers": ["email"]}	{"sub": "4de5a99f-c920-476e-b742-57a467e0fc62", "role": "store_owner", "email": "shopowner1@test.com", "full_name": "테스트 점주1", "last_name": "점주1", "storeName": "테스트 편의점1", "first_name": "테스트", "storePhone": "02-1111-1111", "storeAddress": "서울시 강남구 테스트로 123", "email_verified": true, "phone_verified": false}	\N	2025-08-07 08:39:07.150081+00	2025-08-07 08:39:07.175335+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c907860e-e21c-4a99-94a8-15fd5295878d	authenticated	authenticated	hq@test.com	$2a$10$40A3LpWygeORO5OYpVDm6.ibxAr4Cy42W62hjEEo3NPqzwSGAy7PK	2025-08-07 08:39:49.361704+00	\N		\N		\N			\N	2025-08-07 08:39:49.365703+00	{"provider": "email", "providers": ["email"]}	{"sub": "c907860e-e21c-4a99-94a8-15fd5295878d", "role": "headquarters", "email": "hq@test.com", "full_name": "테스트 본사", "last_name": "본사", "first_name": "테스트", "email_verified": true, "phone_verified": false}	\N	2025-08-07 08:39:49.35701+00	2025-08-07 08:39:49.367285+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	3a40a11e-6a63-4259-b387-a33948e9d91a	authenticated	authenticated	customer1@test.com	$2a$10$jcxIF8QWPf7CcJD6TPiYMeSt6ngKmxaQKinPSqfx2jpqn9K44TlTG	2025-08-07 08:38:10.99936+00	\N		\N		\N			\N	2025-08-07 08:41:12.429471+00	{"provider": "email", "providers": ["email"]}	{"sub": "3a40a11e-6a63-4259-b387-a33948e9d91a", "role": "customer", "email": "customer1@test.com", "full_name": "테스트 점주1", "last_name": "점주1", "first_name": "테스트", "email_verified": true, "phone_verified": false}	\N	2025-08-07 08:38:10.959621+00	2025-08-07 23:44:04.202461+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	49761aab-c140-4ec0-8792-ff716f69ff07	authenticated	authenticated	customer2@test.com	$2a$10$X7TU9sNXVmuuA8hD9KKIKOJLafaKX5ge7Udljhr.cgtQ9UUINUi4u	2025-08-07 08:38:30.966253+00	\N		\N		\N			\N	2025-08-07 08:38:30.969507+00	{"provider": "email", "providers": ["email"]}	{"sub": "49761aab-c140-4ec0-8792-ff716f69ff07", "role": "customer", "email": "customer2@test.com", "full_name": "테스트 고객2", "last_name": "고객2", "first_name": "테스트", "email_verified": true, "phone_verified": false}	\N	2025-08-07 08:38:30.960883+00	2025-08-07 08:38:30.971902+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") FROM stdin;
3a40a11e-6a63-4259-b387-a33948e9d91a	3a40a11e-6a63-4259-b387-a33948e9d91a	{"sub": "3a40a11e-6a63-4259-b387-a33948e9d91a", "role": "customer", "email": "customer1@test.com", "full_name": "테스트 점주1", "last_name": "점주1", "first_name": "테스트", "email_verified": false, "phone_verified": false}	email	2025-08-07 08:38:10.981643+00	2025-08-07 08:38:10.981694+00	2025-08-07 08:38:10.981694+00	0f41516e-cc8e-49c3-acac-5cad22337091
49761aab-c140-4ec0-8792-ff716f69ff07	49761aab-c140-4ec0-8792-ff716f69ff07	{"sub": "49761aab-c140-4ec0-8792-ff716f69ff07", "role": "customer", "email": "customer2@test.com", "full_name": "테스트 고객2", "last_name": "고객2", "first_name": "테스트", "email_verified": false, "phone_verified": false}	email	2025-08-07 08:38:30.963461+00	2025-08-07 08:38:30.963508+00	2025-08-07 08:38:30.963508+00	34756126-2d08-4bc8-889e-c702c00a8a97
4de5a99f-c920-476e-b742-57a467e0fc62	4de5a99f-c920-476e-b742-57a467e0fc62	{"sub": "4de5a99f-c920-476e-b742-57a467e0fc62", "role": "store_owner", "email": "shopowner1@test.com", "full_name": "테스트 점주1", "last_name": "점주1", "storeName": "테스트 편의점1", "first_name": "테스트", "storePhone": "02-1111-1111", "storeAddress": "서울시 강남구 테스트로 123", "email_verified": false, "phone_verified": false}	email	2025-08-07 08:39:07.164501+00	2025-08-07 08:39:07.16698+00	2025-08-07 08:39:07.16698+00	b8b41c6e-0b21-4e90-9b03-3a1baa86c506
b03e3bb0-3d16-4c75-a0f1-cffc793b0441	b03e3bb0-3d16-4c75-a0f1-cffc793b0441	{"sub": "b03e3bb0-3d16-4c75-a0f1-cffc793b0441", "role": "store_owner", "email": "shopowner2@test.com", "full_name": "테스트 점주2", "last_name": "점주2", "storeName": "테스트 편의점2", "first_name": "테스트", "storePhone": "02-2222-2222", "storeAddress": "솔샘로 174", "email_verified": false, "phone_verified": false}	email	2025-08-07 08:39:32.548668+00	2025-08-07 08:39:32.548711+00	2025-08-07 08:39:32.548711+00	829e96b1-6122-485d-8111-32adaa82d6b2
c907860e-e21c-4a99-94a8-15fd5295878d	c907860e-e21c-4a99-94a8-15fd5295878d	{"sub": "c907860e-e21c-4a99-94a8-15fd5295878d", "role": "headquarters", "email": "hq@test.com", "full_name": "테스트 본사", "last_name": "본사", "first_name": "테스트", "email_verified": false, "phone_verified": false}	email	2025-08-07 08:39:49.359281+00	2025-08-07 08:39:49.359333+00	2025-08-07 08:39:49.359333+00	f3e6418a-2013-47b7-b567-75ad9b6cdc29
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."instances" ("id", "uuid", "raw_base_config", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") FROM stdin;
3f0ab95b-c4fd-4c25-b137-1a97b420ce74	3a40a11e-6a63-4259-b387-a33948e9d91a	2025-08-07 08:41:12.429561+00	2025-08-07 23:44:04.211744+00	\N	aal1	\N	2025-08-07 23:44:04.211657	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	220.68.154.6	\N
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") FROM stdin;
3f0ab95b-c4fd-4c25-b137-1a97b420ce74	2025-08-07 08:41:12.481855+00	2025-08-07 08:41:12.481855+00	password	99757ee3-1979-461c-884b-f315aab801c2
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_factors" ("id", "user_id", "friendly_name", "factor_type", "status", "created_at", "updated_at", "secret", "phone", "last_challenged_at", "web_authn_credential", "web_authn_aaguid") FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."mfa_challenges" ("id", "factor_id", "created_at", "verified_at", "ip_address", "otp_code", "web_authn_session_data") FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") FROM stdin;
00000000-0000-0000-0000-000000000000	6	65ktodroe5id	3a40a11e-6a63-4259-b387-a33948e9d91a	t	2025-08-07 08:41:12.452217+00	2025-08-07 23:44:04.184398+00	\N	3f0ab95b-c4fd-4c25-b137-1a97b420ce74
00000000-0000-0000-0000-000000000000	7	5mh24rdep3f5	3a40a11e-6a63-4259-b387-a33948e9d91a	f	2025-08-07 23:44:04.196676+00	2025-08-07 23:44:04.196676+00	65ktodroe5id	3f0ab95b-c4fd-4c25-b137-1a97b420ce74
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_providers" ("id", "resource_id", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_providers" ("id", "sso_provider_id", "entity_id", "metadata_xml", "metadata_url", "attribute_mapping", "created_at", "updated_at", "name_id_format") FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."saml_relay_states" ("id", "sso_provider_id", "request_id", "for_email", "redirect_to", "created_at", "updated_at", "flow_state_id") FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY "auth"."sso_domains" ("id", "sso_provider_id", "domain", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."categories" ("id", "name", "slug", "parent_id", "icon_url", "description", "display_order", "is_active", "created_at", "updated_at") FROM stdin;
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
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."profiles" ("id", "role", "full_name", "phone", "avatar_url", "address", "preferences", "is_active", "created_at", "updated_at") FROM stdin;
3a40a11e-6a63-4259-b387-a33948e9d91a	customer	테스트 점주1	\N	\N	\N	{}	t	2025-08-07 08:38:11.327419+00	2025-08-07 08:38:11.327419+00
49761aab-c140-4ec0-8792-ff716f69ff07	customer	테스트 고객2	\N	\N	\N	{}	t	2025-08-07 08:38:31.170494+00	2025-08-07 08:38:31.170494+00
4de5a99f-c920-476e-b742-57a467e0fc62	store_owner	테스트 점주1	\N	\N	\N	{}	t	2025-08-07 08:39:07.347715+00	2025-08-07 08:39:07.347715+00
b03e3bb0-3d16-4c75-a0f1-cffc793b0441	store_owner	테스트 점주2	\N	\N	\N	{}	t	2025-08-07 08:39:32.643532+00	2025-08-07 08:39:32.643532+00
c907860e-e21c-4a99-94a8-15fd5295878d	headquarters	테스트 본사	\N	\N	\N	{}	t	2025-08-07 08:39:49.475554+00	2025-08-07 08:39:49.475554+00
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."stores" ("id", "name", "owner_id", "address", "phone", "business_hours", "location", "delivery_available", "pickup_available", "delivery_radius", "min_order_amount", "delivery_fee", "is_active", "created_at", "updated_at") FROM stdin;
075459fe-1cd7-4ad1-8613-09db72cc1c8c	테스트 편의점1	4de5a99f-c920-476e-b742-57a467e0fc62	서울시 강남구 테스트로 123	02-1111-1111	{"fri": {"open": "07:00", "close": "23:00"}, "mon": {"open": "07:00", "close": "23:00"}, "sat": {"open": "07:00", "close": "23:00"}, "sun": {"open": "07:00", "close": "23:00"}, "thu": {"open": "07:00", "close": "23:00"}, "tue": {"open": "07:00", "close": "23:00"}, "wed": {"open": "07:00", "close": "23:00"}}	0101000020E61000000000000000C05F400000000000C04240	t	t	3000	0	0	t	2025-08-07 08:39:07.508291+00	2025-08-07 08:39:07.508291+00
c0a1ba3a-a5e3-44d7-b006-9f70ae06b532	테스트 편의점2	b03e3bb0-3d16-4c75-a0f1-cffc793b0441	솔샘로 174	02-2222-2222	{"fri": {"open": "07:00", "close": "23:00"}, "mon": {"open": "07:00", "close": "23:00"}, "sat": {"open": "07:00", "close": "23:00"}, "sun": {"open": "07:00", "close": "23:00"}, "thu": {"open": "07:00", "close": "23:00"}, "tue": {"open": "07:00", "close": "23:00"}, "wed": {"open": "07:00", "close": "23:00"}}	0101000020E61000000000000000C05F400000000000C04240	t	t	3000	0	0	t	2025-08-07 08:39:32.724734+00	2025-08-07 08:39:32.724734+00
\.


--
-- Data for Name: daily_sales_summary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."daily_sales_summary" ("id", "store_id", "date", "total_orders", "pickup_orders", "delivery_orders", "cancelled_orders", "total_revenue", "total_items_sold", "avg_order_value", "hourly_stats", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."products" ("id", "name", "description", "barcode", "category_id", "brand", "manufacturer", "unit", "image_urls", "base_price", "cost_price", "tax_rate", "is_active", "requires_preparation", "preparation_time", "nutritional_info", "allergen_info", "created_at", "updated_at", "is_wishlisted", "wishlist_count") FROM stdin;
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
-- Data for Name: store_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."store_products" ("id", "store_id", "product_id", "price", "stock_quantity", "safety_stock", "max_stock", "is_available", "discount_rate", "promotion_start_date", "promotion_end_date", "created_at", "updated_at") FROM stdin;
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
-- Data for Name: inventory_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."inventory_transactions" ("id", "store_product_id", "transaction_type", "quantity", "previous_quantity", "new_quantity", "reference_type", "reference_id", "unit_cost", "total_cost", "reason", "notes", "created_by", "created_at") FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."notifications" ("id", "user_id", "type", "title", "message", "data", "priority", "is_read", "read_at", "expires_at", "created_at") FROM stdin;
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."orders" ("id", "order_number", "customer_id", "store_id", "type", "status", "subtotal", "tax_amount", "delivery_fee", "discount_amount", "total_amount", "delivery_address", "delivery_notes", "payment_method", "payment_status", "payment_data", "pickup_time", "estimated_preparation_time", "completed_at", "cancelled_at", "notes", "cancel_reason", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."order_items" ("id", "order_id", "product_id", "product_name", "quantity", "unit_price", "discount_amount", "subtotal", "options", "created_at") FROM stdin;
\.


--
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."order_status_history" ("id", "order_id", "status", "changed_by", "notes", "created_at") FROM stdin;
\.


--
-- Data for Name: product_sales_summary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."product_sales_summary" ("id", "store_id", "product_id", "date", "quantity_sold", "revenue", "avg_price", "created_at") FROM stdin;
\.


--
-- Data for Name: product_wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."product_wishlists" ("id", "product_id", "user_id", "created_at") FROM stdin;
\.


--
-- Data for Name: supply_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."supply_requests" ("id", "request_number", "store_id", "requested_by", "status", "priority", "total_amount", "approved_amount", "expected_delivery_date", "actual_delivery_date", "approved_by", "approved_at", "notes", "rejection_reason", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: shipments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."shipments" ("id", "shipment_number", "supply_request_id", "status", "carrier", "tracking_number", "shipped_at", "estimated_delivery", "delivered_at", "notes", "failure_reason", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY "public"."spatial_ref_sys" ("srid", "auth_name", "auth_srid", "srtext", "proj4text") FROM stdin;
\.


--
-- Data for Name: supply_request_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."supply_request_items" ("id", "supply_request_id", "product_id", "product_name", "requested_quantity", "approved_quantity", "unit_cost", "total_cost", "reason", "current_stock", "created_at") FROM stdin;
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."system_settings" ("id", "key", "value", "description", "category", "is_public", "created_at", "updated_at") FROM stdin;
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
-- Data for Name: wishlists; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."wishlists" ("id", "created_at", "user_id", "product_id") FROM stdin;
042b3e11-298d-48f6-893a-d82fa755fc9c	2025-08-08 01:37:25.502202+00	b03e3bb0-3d16-4c75-a0f1-cffc793b0441	f305b043-d3ec-4dc8-ad66-f96d5f638e24
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."buckets_analytics" ("id", "type", "format", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") FROM stdin;
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads" ("id", "in_progress_size", "upload_signature", "bucket_id", "key", "version", "owner_id", "created_at", "user_metadata") FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY "storage"."s3_multipart_uploads_parts" ("id", "upload_id", "size", "part_number", "bucket_id", "key", "etag", "owner_id", "version", "created_at") FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 7, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
