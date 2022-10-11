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

  function parentAddClick() {
    parent.current?.addEventListener("click", () => {
      listData.current.push("parent");
      updateList([...listData.current]);
    });
  }
  function parentAddCaptureClick() {
    parent.current?.addEventListener(
      "click",
      () => {
        listData.current.push("parent-capture");
        updateList([...listData.current]);
      },
      { capture: true }
    );
  }
  function childrenAddClick() {
    children.current?.addEventListener("click", () => {
      listData.current.push("children");
      updateList([...listData.current]);
    });
  }
  function childrenAddCaptureClick() {
    children.current?.addEventListener(
      "click",
      () => {
        listData.current.push("children-capture");
        updateList([...listData.current]);
      },
      { capture: true }
    );
  }
  function addEvent(event: string) {
    let e: Record<string, Function[]> = {
      "1": [parentAddClick, childrenAddClick],
      "2": [parentAddClick, childrenAddClick, parentAddCaptureClick],
    };
    e[event].map((item) => item());
  }
}

export default EventDelegation;
