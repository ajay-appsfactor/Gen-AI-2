"use client";

import ChatGPT from "../icons/ChatGPT";
import { SidebarCloseIcon, SidebarOpenIcon } from "lucide-react";
import Link from "next/link";
import NewChat from "../icons/NewChat";
import Search from "../icons/Search";
import NewProject from "../icons/NewProject";
import clsx from "clsx";
import { useState } from "react";
import { useChats } from "@/hooks/chat";

export default function Sidepanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [chats, setChats] = useState([]);
//   const { chats = [] } = useChats();

  return (
    <div
      className={clsx(
        "bg-gray-50 transition-all duration-150 flex flex-col h-screen overflow-y-auto border-r border-gray-200",
        collapsed ? "w-[50px]" : "w-[260px]"
      )}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50">
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <ChatGPT className="w-6 h-6 text-black" />
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="cursor-pointer ml-auto"
          >
            {collapsed ? (
              <SidebarOpenIcon className="h-6 w-6 text-gray-600" />
            ) : (
              <SidebarCloseIcon className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Top Links */}
        <div className="px-2">
          <Link href="/" className="sidebar-link px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
            <NewChat className="w-6 h-6" />
            {!collapsed && <span>New chat</span>}
          </Link>

          <Link href="/" className="sidebar-link px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
            <Search className="w-6 h-6" />
            {!collapsed && <span>Search chat</span>}
          </Link>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div>
          <div className="my-6 mx-2">
            <Link href="/" className="sidebar-link px-2 rounded-sm flex gap-3 py-2 text-md w-full hover:bg-gray-200">
              <NewProject className="w-6 h-6" />
              New Project
            </Link>
          </div>

          {/* Chats */}
          <div className="my-6 mx-2">
            <p className="px-2 text-gray-500 text-sm">Chats</p>
            <div className="mt-2 space-y-1">
              {chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/c/${chat.id}`}
                  className="block p-2 rounded-sm text-sm hover:bg-gray-200 truncate"
                >
                  {chat.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-2 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-400 text-white flex items-center justify-center">
              A
            </div>

            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm">Appsfactor</span>
                <span className="text-xs text-gray-500">Free</span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button className="px-3 py-1 bg-white rounded-2xl border text-xs font-medium">
              Upgrade
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
