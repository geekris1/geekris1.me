import { useState, useRef, useEffect } from "react";
import "./EventDelegation.css";

function EventDelegation() {
  const [list, updateList] = useState<string[]>([]);
  const listData = useRef<string[]>([]);
  const parent = useRef<HTMLDivElement>();
  useEffect(() => {
    parentAddClick();
  }, []);

  return (
    <div display-flex h-50 className="bg1 event-delegation justify-between">
      <div className="w-49% bg2">
        <div cursor-pointer ref={parent as any}>
          <div>1</div>
          <div>2</div>
          <div>3</div>
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
  }
}

export default EventDelegation;
