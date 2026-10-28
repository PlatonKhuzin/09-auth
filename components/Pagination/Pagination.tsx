"use client";

import ReactPaginateModule from "react-paginate";
import type { ReactPaginateProps } from "react-paginate";
import type { ComponentType } from "react";
import css from "./Pagination.module.css";
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
type ModuleWithDefault<T> = { default: T };
const ReactPaginate =
  (
    ReactPaginateModule as unknown as ModuleWithDefault<
      ComponentType<ReactPaginateProps>
    >
  ).default ??
  (ReactPaginateModule as unknown as ComponentType<ReactPaginateProps>);
export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <ReactPaginate
      pageCount={totalPages}
      pageRangeDisplayed={5}
      marginPagesDisplayed={1}
      forcePage={page - 1}
      onPageChange={({ selected }: { selected: number }) =>
        onPageChange(selected + 1)
      }
      containerClassName={css.pagination}
      activeClassName={css.active}
      nextLabel="→"
      previousLabel="←"
      renderOnZeroPageCount={null}
    />
  );
}
