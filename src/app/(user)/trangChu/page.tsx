import Hero from '@/src/component/user/hero'
import ListMovieDebuted from '@/src/component/user/listMovieDebuted'
import ListMovieCommingSoon from '@/src/component/user/listMovieCommingSoon'

export default function UserHomePage() {
  return (
    <div className="relative w-full overflow-x-hidden">
      <section className="w-full bg-neutral-950">
        <Hero />
      </section>

      <section className="flex min-h-screen w-full items-center justify-center ">
        <ListMovieDebuted />
      </section>

      <section className="w-full bg-neutral-950 py-10 sm:py-12 lg:flex lg:min-h-[calc(100vh-5rem)] lg:items-center lg:py-8">
        <ListMovieCommingSoon />
      </section>
    </div>
  )
}
