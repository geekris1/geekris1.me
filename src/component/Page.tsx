import type { ReactNode } from "react";
interface Props {
  children: ReactNode;
}

function Page(props: Props) {
  const { children } = props;
  console.log(props, "111");
  return (
    <div className="prose m-auto">
      from:component
      {children}
    </div>
  );
}
export default Page;
