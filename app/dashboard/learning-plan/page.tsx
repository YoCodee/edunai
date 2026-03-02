export default async function learningPage() {
  return (
    <div>
      <h1>Learning Plan</h1>
      <div className="container">
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2 ">
            <div className="bg-white mb-2 w-3/4 p-4 h-[150px] rounded-xl shadow-sm">
              <h1>Medical Technology</h1>
              <p>Bachelor of Science</p>
            </div>
            <div className="relative">
              <div className="bg-white p-4 w-3/4 rounded-xl shadow-sm absolute top-4 -left-[10px] rotate-2">
                <p>4 Year Program</p>
                <p>120 Credits</p>
                <p>8 Semesters</p>
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <div className="h-1/2"></div>
            <div className="bg-white mb-2 p-4 rounded-xl shadow-sm">
              <h1>Medical Technology</h1>
              <p>Bachelor of Science</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <p>4 Year Program</p>
              <p>120 Credits</p>
              <p>8 Semesters</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
