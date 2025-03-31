import React, { useState, useEffect, useRef } from 'react';
import TabNavigation from '../components/tabNavigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchChats,
  createChat,
  sendMessage,
  setCurrentChat,
} from '../store/chatSlice';
import { toast } from 'react-toastify';
import { Chat } from '../services/chatService';

const AskGenieView: React.FC<{
  activeTab: 'mealPlanner' | 'askGenie';
  setActiveTab: (tab: 'mealPlanner' | 'askGenie') => void;
}> = ({ activeTab, setActiveTab }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { chats, currentChat, loading } = useSelector(
    (state: RootState) => state.chats
  );

  const [inputText, setInputText] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  useEffect(() => {
    if (chats.length > 0 && !currentChat) {
      dispatch(setCurrentChat(chats[0]));
    }
  }, [chats, currentChat, dispatch]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentChat?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && currentChat) {
      dispatch(sendMessage({ chatId: currentChat._id, message: inputText }));
      setInputText('');
    } else if (inputText.trim()) {
      // Create new chat first then send message
      dispatch(createChat())
        .unwrap()
        .then((newChat) => {
          dispatch(sendMessage({ chatId: newChat._id, message: inputText }));
          setInputText('');
        })
        .catch((error) => {
          toast.error(`Failed to create chat: ${error}`);
        });
    }
  };

  const handleNewChat = () => {
    dispatch(createChat());
  };

  const handleChatSelect = (chat: Chat) => {
    dispatch(setCurrentChat(chat));
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='flex h-[calc(100vh-64px)] w-full overflow-hidden'>
      {/* Left sidebar - chat history */}
      <div className='w-1/5 min-w-[250px] relative border-r border-gray-100 shadow-md flex flex-col pt-4'>
        <div className='overflow-y-auto pb-16'>
          <div className='px-4'>
            <p className='text-sm font-medium text-gray-400'>Chat History</p>
          </div>
          <div className='p-4'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <svg
                  className='h-5 w-5 text-gray-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </div>
              <input
                type='text'
                placeholder='Search anything'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 pr-4 py-2 w-full text-sm text-gray-400 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
              />
            </div>
          </div>

          {/* Chat history list */}
          <div className='flex-1 mt-4'>
            {filteredChats.map((chat) => (
              <div key={chat._id} className='p-2 space-y-2'>
                <div className='text-xs text-gray-400 font-medium px-2'>
                  {new Date(chat.updatedAt).toLocaleDateString()}
                </div>
                <div
                  className={`font-medium text-gray-600 text-sm px-2 py-3 rounded-lg hover:border hover:border-gray-400 hover:bg-gray-50 cursor-pointer ${
                    currentChat?._id === chat._id
                      ? 'bg-gray-100 border border-gray-300'
                      : ''
                  }`}
                  onClick={() => handleChatSelect(chat)}
                >
                  {chat.title}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='border-t border-gray-300 bg-gray-50 sticky bottom-0 max-h-[70px] py-3.5 w-full text-center'>
          <button
            onClick={handleNewChat}
            className='cursor-pointer py-3 max-w-[250px] mx-auto px-4 bg-gray-900 text-white text-sm rounded-3xl flex items-center justify-center gap-2 w-full'
            type='button'
          >
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 6v6m0 0v6m0-6h6m-6 0H6'
              />
            </svg>
            Add a new chat
          </button>
        </div>
      </div>

      {/* Main content - chat area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <div className='p-6'>
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className='flex-1 flex flex-col p-6 mx-6 overflow-y-auto bg-gray-50 rounded-xl'>
          {loading && !currentChat?.messages?.length && (
            <div className='flex justify-center items-center h-full'>
              <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900'></div>
            </div>
          )}
          {!loading && (!currentChat || !currentChat.messages?.length) ? (
            <div className='flex flex-col items-center justify-center h-full text-center'>
              <h2 className='text-2xl font-medium text-gray-600 mb-2'>
                Hi, I'm Genie 🤚🏽
              </h2>
              <p className='text-gray-500 font-normal'>
                How can I be of help to you today?
              </p>
            </div>
          ) : (
            <div className='space-y-4 flex-1'>
              {currentChat?.messages?.map((msg, index) => (
                <div
                  key={index}
                  className={`p-2.5 rounded-lg max-w-[80%] border w-max text-gray-600 border-gray-200 text-sm ${
                    msg.isUser ? 'ml-auto' : ''
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className='border-t border-gray-300 h-[70px] px-4 py-3.5 w-full'>
          <form
            onSubmit={handleSendMessage}
            className='flex items-center gap-2'
          >
            <input
              type='text'
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder='Ask Genie anything...'
              className='flex-1 px-4 py-2 border text-sm text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900'
            />
            <button
              type='submit'
              className='p-2 bg-gray-800 text-white rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={loading}
            >
              <svg
                className='w-5 h-5 transform rotate-90'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8'
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskGenieView;
