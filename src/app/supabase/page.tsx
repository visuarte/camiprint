import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import ConfirmClearForm from './confirm-clear-form'

export default async function SupabasePage() {
  async function addTodo(formData: FormData) {
    'use server'

    const name = String(formData.get('name') ?? '').trim()
    if (!name) return

    const supabase = await createClient()
    await supabase.from('todos').insert({ name })
    revalidatePath('/supabase')
  }

  async function renameTodo(formData: FormData) {
    'use server'

    const id = String(formData.get('id') ?? '').trim()
    const name = String(formData.get('name') ?? '').trim()
    if (!id || !name) return

    const supabase = await createClient()
    await supabase.from('todos').update({ name }).eq('id', id)
    revalidatePath('/supabase')
  }

  async function deleteTodo(formData: FormData) {
    'use server'

    const id = String(formData.get('id') ?? '').trim()
    if (!id) return

    const supabase = await createClient()
    await supabase.from('todos').delete().eq('id', id)
    revalidatePath('/supabase')
  }

  async function clearTodos() {
    'use server'

    const supabase = await createClient()
    await supabase.from('todos').delete().neq('id', 0)
    revalidatePath('/supabase')
  }

  const supabase = await createClient()
  const { data: todos, error } = await supabase
    .from('todos')
    .select('id, name')
    .order('id', { ascending: false })
    .limit(20)

  const totalTodos = todos?.length ?? 0
  const avgLength = totalTodos
    ? Math.round((todos ?? []).reduce((acc, todo) => acc + String(todo.name ?? '').length, 0) / totalTodos)
    : 0

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">Supabase Test</h1>
        <p className="mt-4 text-red-600">Error: {error.message}</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Supabase Test</h1>
      <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article className="rounded border border-gray-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total visibles</p>
          <p className="text-2xl font-semibold text-gray-900">{totalTodos}</p>
        </article>
        <article className="rounded border border-gray-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Longitud media</p>
          <p className="text-2xl font-semibold text-gray-900">{avgLength}</p>
        </article>
        <article className="rounded border border-gray-200 bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">Estado</p>
          <p className="text-sm font-semibold text-emerald-700">Conexion activa</p>
        </article>
      </section>
      <section className="mt-4 rounded border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <h2 className="text-base font-semibold">Que es esta pagina</h2>
        <p className="mt-2">
          Esta pagina es una prueba funcional de la integracion con Supabase dentro de Next.js.
        </p>
        <h3 className="mt-3 text-sm font-semibold">Para que sirve</h3>
        <p className="mt-1">
          Sirve para validar conexion, lectura y escritura en la tabla <code>public.todos</code>
          sin salir de la app.
        </p>
        <h3 className="mt-3 text-sm font-semibold">Que hace</h3>
        <ul className="mt-1 list-disc pl-5">
          <li>Lee y muestra los ultimos todos guardados en Supabase.</li>
          <li>Crea nuevos todos desde el formulario.</li>
          <li>Refresca la lista automaticamente despues de guardar.</li>
        </ul>
        <h3 className="mt-3 text-sm font-semibold">Funciones premium</h3>
        <ul className="mt-1 list-disc pl-5">
          <li>Indicadores rapidos (total, media de texto y estado de conexion).</li>
          <li>Plantillas de alta rapida con un clic.</li>
          <li>Edicion inline por fila sin salir de la pantalla.</li>
          <li>Eliminacion por item y limpieza global de la lista.</li>
        </ul>
      </section>
      <section className="mt-4 rounded border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        <h2 className="text-base font-semibold text-gray-900">Guia de uso</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Escribe el texto de un todo en el campo "Nuevo todo".</li>
          <li>Pulsa "Agregar" para guardarlo en la tabla <code>public.todos</code>.</li>
          <li>La lista se actualiza automaticamente y muestra los mas recientes arriba.</li>
          <li>Si aparece un error, revisa variables de entorno y conexion a Supabase.</li>
        </ol>
      </section>
      <form action={addTodo} className="mt-6 flex gap-2">
        <input
          type="text"
          name="name"
          placeholder="Nuevo todo"
          className="w-full rounded border border-gray-300 px-3 py-2"
          required
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Agregar
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <form action={addTodo}>
          <input type="hidden" name="name" value="Llamar al cliente" />
          <button type="submit" className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100">
            + Llamar al cliente
          </button>
        </form>
        <form action={addTodo}>
          <input type="hidden" name="name" value="Validar presupuesto" />
          <button type="submit" className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100">
            + Validar presupuesto
          </button>
        </form>
        <form action={addTodo}>
          <input type="hidden" name="name" value="Enviar muestra al equipo" />
          <button type="submit" className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100">
            + Enviar muestra
          </button>
        </form>
      </div>

      <ul className="mt-6 space-y-3">
        {todos?.map((todo) => (
          <li key={todo.id} className="rounded border border-gray-200 bg-white p-3">
            <form action={renameTodo} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input type="hidden" name="id" value={String(todo.id)} />
              <input
                type="text"
                name="name"
                defaultValue={String(todo.name ?? '')}
                className="w-full rounded border border-gray-300 px-3 py-2"
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
                  Guardar
                </button>
              </div>
            </form>
            <form action={deleteTodo} className="mt-2">
              <input type="hidden" name="id" value={String(todo.id)} />
              <button type="submit" className="rounded bg-red-600 px-3 py-1.5 text-xs text-white">
                Eliminar
              </button>
            </form>
          </li>
        ))}
      </ul>

      <ConfirmClearForm action={clearTodos} />
    </main>
  )
}
