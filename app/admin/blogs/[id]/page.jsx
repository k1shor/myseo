"use client";
import BlogEditor from "../../../../components/BlogEditor";

export default function EditBlogPage({ params }) {
  return <BlogEditor mode="edit" id={params.id} />;
}
