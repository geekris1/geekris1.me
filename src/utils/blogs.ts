/// <reference types="vite-plugin-pages/client-react" />

import routes from "~react-pages";
import { formatData } from "./formatDate";
const pathBase = 'blogs'

interface BlogRoutes {

  path: any;
  date: string;
  year: string;
  title: any;
  description: any;
  tag: any;
}
export function handleBlogRoutes() {
  return routes.find(route => route.path === pathBase)?.children!.map(item => {
    const { meta, path } = item as any;
    if (path === '') return undefined;
    return {
      path: path,
      date: formatData(meta?.frontmatter.date),
      year: formatData(meta?.frontmatter.date, 'YYYY'),
      title: meta?.frontmatter.title,
      description: meta?.frontmatter.description,
      tag: meta?.frontmatter.tag || [],
    }
  }).filter(Boolean).sort((a: any, b: any) => +new Date(b.date) - +new Date(a.date))

}

export function isFirstDate(blog: any, blogs: any[]) {
  const { year, path } = blog
  const filterList = blogs.filter(item => item.year === year)
  if (filterList.length === 1)
    return true
  return filterList[0].path === path
}