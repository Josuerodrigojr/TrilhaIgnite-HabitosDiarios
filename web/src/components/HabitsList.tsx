import * as CheckBox from '@radix-ui/react-checkbox'
import dayjs from 'dayjs';
import { Check } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/axios';

interface HabitsListInterface{
  date:Date
  onCompletedChanged: (completed:number)=> void
}

interface HabitsInfo{
  possibleHabits:{
    id: string
    title: string
    created_at: string;

  }[],
  completedHabits: string[]
}

export function HabitsList({date, onCompletedChanged}: HabitsListInterface){

const [habitsInfo, setHabitsInfo] = useState<HabitsInfo>()
  useEffect(()=>{
api.get('day', {
  params:{
    date: date.toISOString()
  }
}).then(response=>{
  setHabitsInfo(response.data)
})
  }, [])

  const isDateInPast = dayjs(date).endOf('day').isBefore(new Date())

  async function hadleToggleHabit(habitId: string){


await api.patch(`/habits/${habitId}/toggle`)
const isHabitAlreadyCompleted = habitsInfo!.completedHabits.includes(habitId)
let completedHabits: string[]=[]

if(isHabitAlreadyCompleted){
completedHabits = habitsInfo!.completedHabits.filter(id => id!==habitId)

} else {
completedHabits = [...habitsInfo!.completedHabits, habitId]
}
setHabitsInfo({
  possibleHabits: habitsInfo!.possibleHabits, 
  completedHabits})

onCompletedChanged(completedHabits.length)

  }

return(


<div className='mt-6 flex flex-col gap-3'>
  {habitsInfo?.possibleHabits.map((habit)=>{
    return(
    <CheckBox.Root key={habit.id} onCheckedChange={()=> hadleToggleHabit(habit.id)} checked={habitsInfo.completedHabits.includes(habit.id)} disabled={isDateInPast}   
    className='flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed'>
  <div className='h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors groups-focus:rind-2 groups-focus:ring-violet-700 groups-focus:ring-offset-2 groups-focus:ring-offset-background'>
    <CheckBox.Indicator>
      <Check size={20} className="text-white" />
    </CheckBox.Indicator>
    </div>
    <span className='font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400'>
      {habit.title}
    </span>
  </CheckBox.Root>)
  })}
  
</div>
)}
