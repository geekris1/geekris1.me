import { useState, useRef, useEffect } from "react";
import "./EventDelegation.css";

interface Props {
  event: "stopPropagation" | "stopImmediatePropagation";
}
function EventDelegation(props: Props) {
  const { event } = props;
  console.log(event, "event");
  const [list, updateList] = useState<string[]>([]);
  const listData = useRef<string[]>([]);
  const parent = useRef<HTMLDivElement>();
  const children = useRef<HTMLDivElement>();
  useEffect(() => {
    parentAddClick();
  }, []);

  return (
    <div display-flex h-50 className="bg1 event-delegation justify-between">
      <div className="w-49% bg2">
        <div cursor-pointer ref={parent as any}>
          <div ref={children as any}>1</div>
        </div>
      </div>
      <div className="w-49% bg2 overflow-auto">
        {list.map((item, index) => {
          return <div key={index}>{item}</div>;
        })}
      </div>
    </div>
  );

  function parentAddClick() {
    parent.current?.addEventListener("click", (e: any) => {
      listData.current.push(e.target.innerText);
      updateList([...listData.current]);
    });
    children.current?.addEventListener("click", function (e) {
      if (event === "stopPropagation") {
        e.stopPropagation();
      }

      listData.current.push("1");
      updateList([...listData.current]);
    });
    children.current?.addEventListener("click", function (e) {
      if (event === "stopImmediatePropagation") {
        e.stopImmediatePropagation();
      }
      listData.current.push("2");
      updateList([...listData.current]);
    });
    children.current?.addEventListener("click", function (e) {
      listData.current.push("3");
      updateList([...listData.current]);
    });
  }
}

export default EventDelegation;
