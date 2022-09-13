import type { ReactNode } from "react";
import React from "react";
interface Props {
  importComponentName: string[];
  children: ReactNode;
}

function Page(props: Props) {
  const { children, importComponentName } = props;
  console.log(importComponentName, "importComponentName");
  if (importComponentName.includes("BlogList")) {
    return children;
  }
  return <div className="prose m-auto">{children}</div>;
}
export default Page;
