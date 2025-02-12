import { BookMarked } from 'lucide-react';

function Header() {
    return (
        <>
            <div className='flex space-x-12 place-items-center'>
                <BookMarked className='text-white'/>
            <h1 className="text-2xl font-bold text-white">🚀 RESTIFY ~ Test your APIs</h1>
            </div>
        </>
    );
}

export default Header;
