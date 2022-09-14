import React from "react";
import { PropsContext } from "./Page";
interface Props {}
interface Link {
  avatar: string;
  desc: string;
  link: string;
  name: string;
}
function Link(Props: Props) {
  let { attributes } = React.useContext(PropsContext)!;
  return (
    <div>
      {attributes.links.map((link: Link) => {
        return (
          <a
            href={link.link}
            target="_blank"
            key={link.name}
            className="flex items-center hover-op-100"
            cursor-pointer
            op-80
          >
            <img h-60px important-w-60px border-rd-100 src={link.avatar}></img>
            <div className="flex flex-col" m-l-30px>
              <span>{link.name}</span>
              <span>{link.desc}</span>
            </div>
          </a>
        );
      })}
    </div>
  );
}

export default Link;
