import { useState, useRef, useEffect } from "react";
import "./EventDelegation.css";
interface Props {
  event: string;
}
function EventDelegation(props: Props) {
  const [list, updateList] = useState<string[]>([]);
  const listData = useRef<string[]>([]);
  const parent = useRef<HTMLDivElement>();
  const children = useRef<HTMLDivElement>();
  useEffect(() => {
    console.log(props);
    addEvent(props.event);
  }, []);

  return (
    <div display-flex h-50 className="bg1 event-delegation justify-between">
      <div className="w-49% bg2">
        <div cursor-pointer ref={parent as any}>
          parent
          <div ref={children as any} cursor-pointer>
            children
          </div>
        </div>
      </div>
      <div className="w-49% bg2 overflow-auto">
        {list.map((item, index) => {
          return <div key={index}>{item}</div>;
        })}
      </div>
    </div>
  );

  function addEvent(event: string) {
    parent.current?.addEventListener("click", () => {
      listData.current.push("parent");
      updateList([...listData.current]);
    });
    children.current?.addEventListener("click", () => {
      listData.current.push("children");
      console.log(listData);
      updateList([...listData.current]);
    });
    if (event === "2") {
      parent.current?.addEventListener(
        "click",
        () => {
          listData.current.push("parent-capture");
          updateList([...listData.current]);
        },
        { capture: true }
      );
    }
  }
}

export default EventDelegation;
