import { FaRegularCircleCheck } from 'solid-icons/fa'
export default function Thanks() {
     return (
         <div class="h-screen w-screen flex gap-4 flex-col justify-center items-center text-green-500">
             <span class='animate-bounce'><FaRegularCircleCheck size={30}/></span>
             <h1 class='text-xl'>Spotkanie udokumentowane!</h1>
             <a
                class="text-white bg-green-700 hover:bg-green-800 focus:outline-none
                    focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5
                    text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
                 href="/">Powrót do mapy</a>
         </div>
     )
}
