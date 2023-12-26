import {
  Actor,
  ActorConfig,
  ActorSubclass,
  HttpAgent,
  HttpAgentOptions,
} from "@dfinity/agent";
import { ReactNode, useEffect, useState } from "react";

import { ActorContextType } from "./actor-context.type";
import { IDL } from "@dfinity/candid";
import { isDelegationValid } from "@dfinity/identity";
import toast from "react-hot-toast";
import { useIdentity } from "./useIdentity";

interface ActorProviderProps<T> {
  httpAgentOptions?: HttpAgentOptions;
  actorOptions?: ActorConfig;
  context: React.Context<ActorContextType<T> | undefined>;
  idlFactory: IDL.InterfaceFactory;
  canisterId: string;
  children: ReactNode;
}

export function ActorProvider<T>({
  httpAgentOptions,
  actorOptions,
  context,
  idlFactory,
  canisterId,
  children,
}: ActorProviderProps<T>) {
  const [actor, setActor] = useState<ActorSubclass<typeof context>>();
  const { delegationChain, identity, clear } = useIdentity();

  useEffect(() => {
    function createErrorHandlingProxy<T>(
      actor: ActorSubclass<T>
    ): ActorSubclass<T> {
      return new Proxy(actor, {
        get(target, prop, receiver) {
          const originalProperty = Reflect.get(target, prop, receiver);
          if (typeof originalProperty === "function") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return async (...args: any[]) => {
              try {
                return await originalProperty.apply(this, args);
              } catch (err) {
                if (delegationChain && !isDelegationValid(delegationChain)) {
                  clear(); // Clears the identity from the state and local storage. Effectively "logs the user out".
                  setActor(undefined); // Clears the actor from the state.
                } else {
                  if (
                    typeof err === "object" &&
                    err !== null &&
                    "message" in err
                  ) {
                    toast.error(err.message as string, {
                      position: "bottom-right",
                    });
                  }
                }
                throw err; // Re-throw the error after handling
              }
            };
          }
          return originalProperty;
        },
      });
    }

    (async () => {
      if (!identity || !idlFactory || !canisterId || !context) return;

      const agent = new HttpAgent({ identity, ...httpAgentOptions });

      if (process.env.DFX_NETWORK !== "ic") {
        agent.fetchRootKey().catch((err) => {
          console.warn(
            "Unable to fetch root key. Check to ensure that your local replica is running"
          );
          console.error(err);
        });
      }

      const _actor = Actor.createActor<typeof context>(idlFactory, {
        agent,
        canisterId,
        ...actorOptions,
      });

      setActor(createErrorHandlingProxy(_actor));
    })();
  }, [
    identity,
    httpAgentOptions,
    actorOptions,
    idlFactory,
    canisterId,
    context,
    clear,
    delegationChain,
  ]);

  return (
    <context.Provider value={{ actor } as ActorContextType<T>}>
      {children}
    </context.Provider>
  );
}
