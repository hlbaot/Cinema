import Hero from '@/src/component/user/hero'
import ListMovie from '@/src/component/user/listMovie'
import TestingMonial from '@/src/component/user/testingMonial'

export default function UserHomePage() {
  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2">
      <section className="flex min-h-screen w-full items-center justify-center bg-neutral-950">
        <Hero />
      </section>

      <section className="flex min-h-screen w-full items-center justify-center bg-red-700">
        <ListMovie />
      </section>

      <section className="flex min-h-screen w-full items-center justify-center bg-amber-100">
        <TestingMonial />
      </section>
    </div>
  )
}
