import logo from "./logo.svg";
import "./App.css";
import { Table as AliTable } from "@alifd/next";
import "@alifd/next/dist/next.css";
import SelectionArea, { SelectionEvent } from "@viselect/react";
import React, { useEffect, useState } from "react";
import { groupBy, toPairs } from "lodash";
import { useHotkeys } from "react-hotkeys-hook";

const dataSource = () => {
  const result = [];
  for (let i = 0; i < 5; i++) {
    result.push({
      name: `Quotation for 1PCS Nano ${3 + i}.0 controller compatible`,
      id: 100306660940 + i,
      time: 2000 + i,
    });
  }
  return result;
};

function App() {
  const [selected, setSelected] = useState<Set<String>>(() => new Set());
  const selectedList = Array.from(selected)
    .map((item) => item.split("-"))
    .sort((pre, next) => {
      const temp = Number(pre[0]) - Number(next[0]);
      return temp ? temp : Number(pre[1]) - Number(next[1]);
    });
  const rowByList = toPairs(groupBy(selectedList, (item) => item[0]))
    .sort((pre, next) => Number(pre[0]) - Number(next[0]))
    .map((item) => {
      // console.log(item[1]);
      return item[1].map((i) => i[2]).join("\t");
    });
  const pastText = rowByList.join("\r\n");

  const extractIds = (els: Element[]): string[] =>
    els
      .map((v) => v.getAttribute("data-key"))
      .filter(Boolean)
      .map(String);

  const onStart = ({ event, selection }: SelectionEvent) => {
    if (!event?.ctrlKey && !event?.metaKey) {
      selection.clearSelection();
      setSelected(() => new Set());
    }
  };

  const onMove = ({
    store: {
      changed: { added, removed },
    },
  }: SelectionEvent) => {
    setSelected((prev) => {
      const next = new Set(prev);
      extractIds(added).forEach((id) => next.add(id));
      extractIds(removed).forEach((id) => next.delete(id));
      return next;
    });
  };

  const renderSelectableCell =
    (dataIndex: string, colIdx: number) =>
    (value: any, rowIdx: number, record: any) => {
      const dataKey = `${rowIdx}-${colIdx}-${record[dataIndex]}`;
      return (
        <div
          className={
            selected.has(dataKey) ? "selected selectable" : "selectable"
          }
          data-key={dataKey}
        >
          {record[dataIndex]}
        </div>
      );
    };

  useHotkeys("ctrl+c", (event) => {
    event.preventDefault();
    console.log(pastText);
    navigator.clipboard.writeText(pastText);
  });

  return (
    <div className="App">
      <SelectionArea
        className="container"
        onStart={onStart}
        onMove={onMove}
        selectables=".selectable"
      >
        <AliTable dataSource={dataSource()}>
          <AliTable.Column  cell={renderSelectableCell("id", 0)} />
          <AliTable.Column  cell={renderSelectableCell("name", 1)} />
          <AliTable.Column  cell={renderSelectableCell("time", 2)} />
        </AliTable>
      </SelectionArea>
    </div>
  );
}

export default App;
