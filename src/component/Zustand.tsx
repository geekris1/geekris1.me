import { create } from "zustand";

interface State {
  count: number;
}

interface ZustandState extends State {
  add: () => void;
}

const useStore = create<ZustandState>((setState) => {
  return {
    count: 0,
    add: () => {
      setState((state) => {
        return { count: state.count + 1 };
      });
    },
  };
});

export default function Zustand() {
  const { add } = useStore();
  return (
    <div className="zustand">
      <button onClick={add}> + </button>
      <Count></Count>
    </div>
  );
}

function Count() {
  const { count } = useStore();
  return (
    <div mt-1 text-8>
      count is:{count}
    </div>
  );
}
