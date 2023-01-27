import './styles/global.css';
// import { Habit } from "./components/Habit"
import { Header } from './components/Header';
import { SummaryTable } from './components/SummaryTable';
import './lib/dayjs'

//O comando abaixo é para que possamos rodar nosso registro quando a aplicação estiver fechada.

navigator.serviceWorker.register('service-worker.js')
export function App() {
  return (
    // Centralizando toda a minha div e utilizando todo o comprimento e a altura disponiveis
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-full max-w-5xl px-6 flex flex-col gap-16">
<Header/>
<SummaryTable/>

      </div>

      
    </div>
  )
}

