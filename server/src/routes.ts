import { FastifyInstance } from 'fastify';
import { prisma } from './lib/prisma';
import {z} from 'zod'
import dayjs from 'dayjs'



export async function appRoutes(app:FastifyInstance){
  app.get('/', async ()=>{
    const habits = await prisma.habit.findMany()
  
    return habits
  }),
  app.post('/habits', async(request)=>{
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6))
    })
    const {title, weekDays} = createHabitBody.parse(request.body)
// Ele vai zerar as horas quando chamarmos a data
    const today = dayjs().startOf('day').toDate()

    await prisma.habit.create({
      //Aqui estou criando u, hábito na minha aplicação, que será requisitada pelo usuário recebendo o titulo e os dias da semana.
      data:{
        title,
        created_at: today,
        // Como os dias da semana não faz parte da nossa tabela, logo, temos que chamar e mostrar o que está passando nela.
        weekDays:{
          create: weekDays.map(weekDay =>{
            return{
              week_day: weekDay
            }
          })
        }
      }
    })
    

  })

  app.get('/day', async(request)=>{
    const getDayParams = z.object({
      date: z.coerce.date()
    })
    const {date} = getDayParams.parse(request.query)
    const parsedDate = dayjs(date).startOf('day')
    const weekDay = parsedDate.get('day')
//Verificando quais são os hábitos possíveis.
    const possibleHabits = await prisma.habit.findMany({
      where:{
        created_at:{
          lte:date,
        },
        weekDays:{
          some:{
            week_day:weekDay
          }
        }
      }
    })

    const day = await prisma.day.findFirst({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true,
      }
    })

    const completedHabits = day?.dayHabits.map(dayHabit => {
      return dayHabit.habit_id
    }) ?? []

    return {
      possibleHabits,
      completedHabits,
    }
  })

  //Rota para completar ou não completar um hábito

  app.patch('/habits/:id/toggle', async(request)=>{

// Temos que informar atraves do zod que vamos receber essa informação

const toggleHabitParams = z.object({
  id: z.string().uuid()
})
//Pegando a váriavel id do meu parametro

const { id } = toggleHabitParams.parse(request.params)

//Aramazendando o dia atual sem o horário

const today = dayjs().startOf('day').toDate()

//Verificando se meu dia que foi clicado existe no banco de dados para podermos fazer o registro do hábito

let day = await prisma.day.findUnique({
  where: {
    date: today
  }
})


if(!day){
  day = await prisma.day.create({
    data:{
      date:today,
    }
  })
}

const dayHabit = await prisma.dayHabit.findUnique({
  where:{
    day_id_habit_id:{
      day_id:day.id,
      habit_id:id,
    }
  }
})

if(dayHabit){
  //Remover o habito que foi marcado
await prisma.dayHabit.delete({
  where:{
    id:dayHabit.id
  }
})
} else{
//Completar um habito
await prisma.dayHabit.create({
  data:{
    day_id: day.id,
    habit_id:id
  }
})
}



 

  })

  //A rota vai retornar um resumo de uma lista com várias informações da litsa, tendo como foco retorno da data, quantos hábitos deveria cumprir e quantos hábitos foram compridos.

  app.get('/summary', async(request)=>{
    const summary = await prisma.$queryRaw`
    SELECT 
    days.id, 
    days.date,
    (
      SELECT cast(count(*) as float)
    FROM day_habits
    WHERE day_habits.day_id = days.id
    ) as completed, 
    (
      SELECT cast(count(*) as float)
      FROM habit_week_days
      JOIN habits
      ON habits.id = habit_week_days.habit_id
      WHERE 
      habit_week_days.week_day = cast(strftime('%w', days.date/1000.0, 'unixepoch') as int)
      AND habits.created_at <= days.date
    ) as amount
    FROM  days `

    return summary

  })
  
}