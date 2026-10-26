import { LEARNING_TRACKS } from '../data/learningTracks';
export default function LearningTracks(){
 return <section id="learning-tracks" className="bg-neutral-950 py-12 border-b border-neutral-800 text-white">
  <div className="max-w-6xl mx-auto px-5">
   <p className="text-orange-400 font-semibold">Focused learning pathways</p>
   <h2 className="text-3xl font-bold mt-2">Build stronger basics. Learn useful new skills.</h2>
   <p className="mt-3 text-neutral-300">Explore structured pathways within our tuition, English and ChatGPT courses. Tuition fees and trial terms stay the same. Ask us about the right starting point.</p>
   <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">{LEARNING_TRACKS.map(track=><article key={track.id} className="rounded-2xl border border-orange-500/30 bg-neutral-900 p-5 flex flex-col">
    <p className="text-sm text-orange-300">{track.audience}</p><h3 className="text-xl font-bold mt-2">{track.title}</h3>
    <ul className="list-disc pl-5 text-neutral-300 mt-3 space-y-2">{track.topics.map(topic=><li key={topic}>{topic}</li>)}</ul>
    <p className="text-sm text-neutral-400 mt-4">{track.access}</p>
    <a className="mt-5 inline-block rounded-xl border border-orange-500 text-orange-300 p-3 text-center font-semibold" href={`https://wa.me/918792134951?text=${encodeURIComponent(`Hello NextClasses, please share details of ${track.title} for ${track.audience}. I would like to know the learning plan and access options.`)}`}>Enquire about this pathway</a>
   </article>)}</div>
   <p className="text-sm text-neutral-400 mt-4">School AI activities are introductory and parent-guided. We do not claim CBSE approval or affiliation. AI-generated explanations and practice need checking against the textbook.</p>
  </div>
 </section>;
}
