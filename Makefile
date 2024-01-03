deploy-backend:
	dfx canister create ic_siwe_provider
	dfx deploy react_demo_backend --output-env-file .env1 --argument "$$(dfx canister id ic_siwe_provider)"
	dfx deploy ic_siwe_provider --output-env-file .env2 --argument "( \
	    record { \
	        domain = \"localhost\"; \
	        uri = \"http://localhost:5173\"; \
	        salt = \"salt\"; \
	        chain_id = opt 1; \
	        scheme = opt \"http\"; \
	        statement = opt \"Login to the app\"; \
	        sign_in_expires_in = opt 300000000000; /* 5 minutes */ \
	        session_expires_in = opt 604800000000000; /* 1 week */ \
	        targets = opt vec { \
	            \"$$(dfx canister id ic_siwe_provider)\"; \
	            \"$$(dfx canister id react_demo_backend)\"; \
	        }; \
	    } \
	)"
	dfx deploy token_gating --output-env-file .env3
	dfx deploy vetkd_system_api --output-env-file .env4
	cat .env1 .env2 .env3 .env4 > .env
	rm .env1 .env2 .env3 .env4

deploy-frontend:
	npm install
	dfx generate ic_siwe_provider
	dfx generate react_demo_backend
	dfx generate token_gating
	npm run dev

