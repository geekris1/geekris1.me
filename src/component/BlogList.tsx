/// <reference types="vite-plugin-pages/client-react" />

import { handleBlogRoutes, isFirstDate } from "@/utils/blogs";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
const pathBase = "/blogs/";

function BlogList() {
  const blogs = useMemo(handleBlogRoutes, []);
  console.log(blogs);
  return (
    <div className="prose m-auto">
      {blogs!.map((blog) => {
        return (
          <div mb-20px key={blog.path}>
            {isFirstDate(blog, blogs!) ? (
              <div pointer-events-none h-50px className="relative">
                <span className="absolute" text-8em top--40px op-10>
                  {blog.year}
                </span>
              </div>
            ) : null}
            <Link to={blog.path} className="relative">
              <div text-25px>{blog.title}</div>
              <div text-13px>
                <span>{blog.date}</span>
                <span ml-20px>{blog.description}</span>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
export default BlogList;
