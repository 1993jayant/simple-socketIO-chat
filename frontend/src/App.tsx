import { io } from 'socket.io-client'

function App() {
  const socket = io('http://localhost:5000')

  console.log(socket)

  return (
    <div className="container mx-auto max-w-md">

      <div className="flex items-center justify-center gap-2 pt-4 pb-2">
        <span className="text-2xl">
        MongoChat
        </span>
        <span className="rounded-sm bg-orange-500 text-white px-4 py-1">Clear</span>
      </div>

      {/* username input */}
      <input className="w-full px-2 py-1 focus:outline-none rounded-sm border border-gray-200 mb-4" placeholder="Enter name" />

      {/* messages section */}
      <div className="border border-gray-200 rounded-md h-52 mb-4"></div>

      {/* messages input textarea */}
      <textarea className="resize-none border border-gray-200 rounded-sm focus:outline-none px-2 py-1 w-full" placeholder="Enter message" />

    </div>

  );
}

export default App;
