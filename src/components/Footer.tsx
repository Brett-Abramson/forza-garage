export default function Footer() {
  return (
    <footer className="border-t border-fh-border mt-12 py-4 px-4">
      <div className="max-w-screen-2xl mx-auto text-center space-y-0.5 text-[11px] text-fh-muted-2 leading-relaxed">
        <p>
          Forza Garage is an unofficial fan project — not affiliated with Playground Games, Xbox Game Studios, or Microsoft.
        </p>
        <p>
          Car data sourced from{' '}
          <a href="https://www.reddit.com/user/Sliced_Orange1" target="_blank" rel="noopener noreferrer" className="hover:text-fh-muted underline underline-offset-2">u/Sliced_Orange1</a>
          {"'s FH6 car list · Tuning references: "}
          <a href="https://fh6guide.com" target="_blank" rel="noopener noreferrer" className="hover:text-fh-muted underline underline-offset-2">fh6guide.com</a>
          {', '}
          <a href="https://forza.guide" target="_blank" rel="noopener noreferrer" className="hover:text-fh-muted underline underline-offset-2">forza.guide</a>
          {', FH6 community'}
        </p>
      </div>
    </footer>
  )
}
