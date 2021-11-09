import { useRouter } from "next/router";
import useSWR, { SWRConfig } from "swr";
import "tailwindcss/tailwind.css";
import { makeServer } from "../mirage";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Spinner from "../components/spinner";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  if (!window.server) {
    window.server = makeServer({ environment: "development" });
  }
}

export default function Wrapper(props) {
  let router = useRouter();
  let [isFirstRender, setIsFirstRender] = useState(true);
  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  if (!router.isReady || isFirstRender) {
    return null;
  }

  return (
    <SWRConfig
      value={{
        fetcher: (...args) => fetch(...args).then((res) => res.json()),
        suspense: true,
      }}
    >
      <Suspense
        fallback={
          <div className="w-screen h-screen flex justify-center pt-12">
            <Spinner />
          </div>
        }
      >
        <App {...props} />
      </Suspense>
    </SWRConfig>
  );
}

function App({ Component, pageProps }) {
  let { data } = useSWR(`/api/people`);
  let [hasRendered, setHasRendered] = useState(false);
  useEffect(() => {
    setHasRendered(true);
  }, []);

  return (
    <div className="antialiased flex h-screen">
      <div className="w-1/3">
        <div className="border-r flex flex-col max-h-full">
          <Link href="/">
            <a className="px-7 pt-4 pb-2 text-lg font-semibold border-b ">
              People
            </a>
          </Link>
          <ul
            role="list"
            className="divide-y divide-gray-100 max-h-full overflow-y-scroll px-4 pt-2"
          >
            {data.people.map((person) => (
              <PersonLink person={person} key={person.id} />
            ))}
          </ul>
        </div>
      </div>
      <div className="w-2/3">
        <div className="overflow-y-scroll max-h-full">
          {hasRendered ? (
            <Suspense
              fallback={
                <div className="w-full flex justify-center pt-12">
                  <Spinner />
                </div>
              }
            >
              <Component {...pageProps} />
            </Suspense>
          ) : (
            <Component {...pageProps} />
          )}
        </div>
      </div>
    </div>
  );
}

function PersonLink({ person }) {
  let router = useRouter();
  let active = router.asPath === `/people/${person.id}`;

  return (
    <li>
      <Link href={`/people/${person.id}`}>
        <a
          className={`
          ${active ? "bg-gray-200" : "hover:bg-gray-50"} 
          pl-4 pr-3 py-4 flex items-center rounded -my-px relative -mx-1`}
        >
          <div className="flex justify-between items-center w-full">
            <p className="text-sm font-medium">{person.name}</p>
            <span
              className={`${
                active ? "text-blue-500" : "text-blue-500"
              } text-xs font-semibold w-4 inline-block text-center`}
            >
              {person.eventIds.length > 0 && person.eventIds.length}
            </span>
          </div>
        </a>
      </Link>
    </li>
  );
}
