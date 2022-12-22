import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react"
import { io } from "socket.io-client"

const socket = io("http://localhost:5000")
function App() {
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [messageText, setMessageText] = useState<string>("")
  const [usernameText, setUsernameText] = useState<string>("")

  // reset the toast message after 4 seconds
  useEffect(() => {
    if (statusMessage !== "") {
      var timeoutId = setTimeout(() => {
        setStatusMessage("")
      }, 4000)
    }

    // clean up function to avoid memory leak
    return () => {
      clearTimeout(timeoutId)
    }
  }, [statusMessage])

  useEffect(() => {
    if (socket) {
      // on getting chat data from the server
      socket.on("output", (data) => {
        setChatMessages((prev) => prev.concat(...data))
      })

      // get status from the server
      socket.on("status", (data) => {
        if (typeof data === "object") {
          setStatusMessage(data.message)
        } else {
          setStatusMessage(data)
        }

        // clear textarea if the status is clear
        if (data.clear) {
          setMessageText("")
        }
      })

      // clear messages from the UI after clear button is pressed
      socket.on("cleared", () => {
        setChatMessages([])
      })
    }

    // clean up function to remove event listeners on component unmount to prevent multiple event listeners
    return () => {
      socket.removeAllListeners()
    }
  }, [])

  // mutation observer to observe new messages in order to scroll to the bottom
  useEffect(() => {
    const targetNode = document.getElementById("messageContainer")!

    const callback = (
      mutationList: MutationRecord[],
      observer: MutationObserver
    ) => {
      for (const mutation of mutationList) {
        targetNode.scrollTo(0, targetNode.scrollHeight)
      }
    }

    const observer = new MutationObserver(callback)

    // observe only child node changes
    observer.observe(targetNode, {
      childList: true,
    })

    // stop observing after component unmounts
    return () => {
      observer.disconnect()
    }
  }, [])

  // send the chat details to the server when enter key is pressed
  const handleReturnKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" && e.shiftKey === false) {
      e.preventDefault()
      socket.emit("input", {
        name: usernameText,
        message: messageText,
      })
    }
  }

  // handle clear button click
  const clearBtnClickHandler = (e: MouseEvent) => {
    socket.emit("clear")
  }

  return (
    <div className="container mx-auto max-w-md">
      <div className="flex items-center justify-center gap-2 pt-4 pb-2">
        <span className="text-2xl">MongoChat</span>
        <span
          className="rounded-sm bg-orange-500 text-white px-4 py-1 cursor-pointer hover:opacity-90"
          onClick={clearBtnClickHandler}
        >
          Clear
        </span>
      </div>
      <div className="text-orange-400 mb-2 text-sm text-center">
        {statusMessage}&nbsp;
      </div>

      {/* username input */}
      <input
        value={usernameText}
        onChange={(e) => setUsernameText(e.target.value)}
        className="w-full px-2 py-1 focus:outline-none rounded-sm border border-gray-200 mb-4"
        placeholder="Enter name"
      />

      {/* messages section */}
      <div
        id="messageContainer"
        className="border border-gray-200 rounded-md overflow-auto h-52 mb-4"
      >
        {chatMessages.map((message: any, idx: number) => (
          <div key={idx} className="p-1 pb-0">
            <span className="text-slate-400">{message.name}: </span>
            <span className="text-slate-700">{message.message}</span>
          </div>
        ))}
      </div>

      {/* messages input textarea */}
      <textarea
        id="messageInput"
        className="resize-none border border-gray-200 rounded-sm focus:outline-none px-2 py-1 w-full"
        placeholder="Enter message"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={handleReturnKey}
      />
    </div>
  )
}

export default App
