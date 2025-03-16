const Header: React.FC = () => {
  return (
    <header className='flex items-center h-16 px-6 bg-header border-b border-gray-200'>
      <div className='flex items-center gap-2'>
        {/* You can replace this with your actual logo */}
        <div className='w-8 h-8 bg-active rounded-full'></div>
        <h1 className='text-xl font-bold'>Genie</h1>
      </div>
    </header>
  );
};

export default Header;
