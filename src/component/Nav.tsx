import { Link } from "react-router-dom";
import { useDark } from "@/hooks";
import { useMemo } from "react";

function Nav() {
  const [isDark, updateDark] = useDark();
  const modeClassName = useMemo(() => {
    return isDark ? `dark:i-carbon-moon` : `i-carbon-sun`;
  }, [isDark]);
  return (
    <header text-center m-auto pt-15px pb-30px className="prose">
      <Link to="/" title="博客" text-30px>
        Hi , Zhang
      </Link>
      <div mt-2 text-center>
        <Link to="/blogs" title="博客">
          <div className="i-carbon:blog" />
        </Link>
        <Link to="/notes" title="笔记">
          <div className="i-gg:notes" />
        </Link>
        <a target="_blank" href="https://github.com/geekris1" title="github">
          <div i-uil-github-alt />
        </a>
        <a href="#" className={modeClassName} onClick={updateDark} />
      </div>
    </header>
  );
}
export default Nav;
