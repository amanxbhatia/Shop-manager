
import { useEffect, useState } from 'react'
import './index.css'

type Entry = {
  id: string
  date: string
  type: string
  details: string
  amount: number
  createdBy: string
  createdAt: string
  updatedBy: string
  updatedAt: string
}

type Audit = {
  id: string
  entryId: string
  action: string
  by: string
  time: string
  changes: string
}


type Worker = {
  id: string
  name: string
  salary: number
  salaryDay: number
}


type Notice = {
  id: string
  title: string
  requirement: string
  date: string
  time: string
  createdBy: string
  createdAt: string
  completed: boolean
}


const defaultWorkers: Worker[] = [
  { id: 'w1', name: 'Ganesh', salary: 14000, salaryDay: 13 },
  { id: 'w2', name: 'Vishnu', salary: 12000, salaryDay: 17 },
  { id: 'w3', name: 'Shivam', salary: 9500, salaryDay: 20 },
  { id: 'w4', name: 'Sonu', salary: 13500, salaryDay: 15 },
  { id: 'w5', name: 'Sitaram', salary: 14000, salaryDay: 3 },
  { id: 'w6', name: 'Sushil', salary: 19500, salaryDay: 1 },
]


const now = () => new Date().toLocaleString('en-IN')
const today = () => new Date().toISOString().slice(0, 10)

export default function App() {
  const [owner, setOwner] = useState(
    () => localStorage.getItem('shop_owner') || ''
  )
  const [name, setName] = useState('')
  const [page, setPage] = useState('Dashboard')
  const [entries, setEntries] = useState<Entry[]>(() =>
    JSON.parse(localStorage.getItem('shop_entries') || '[]')
  )
  const [audit, setAudit] = useState<Audit[]>(() =>
    JSON.parse(localStorage.getItem('shop_audit') || '[]')
  )
  const [workers, setWorkers] = useState<Worker[]>(() =>
  JSON.parse(localStorage.getItem('shop_workers') || 'null')
  || defaultWorkers
  )
  
  const [notices, setNotices] = useState<Notice[]>(() =>
  JSON.parse(localStorage.getItem('shop_notices') || '[]')
  )

  const [noticeTitle, setNoticeTitle] = useState('')
  const [noticeRequirement, setNoticeRequirement] = useState('')
  const [noticeDate, setNoticeDate] = useState(today())
  const [noticeTime, setNoticeTime] = useState('09:00')

  const [editing, setEditing] = useState<string | null>(null)
  const [date, setDate] = useState(today())
  const [type, setType] = useState('Expense')
  const [details, setDetails] = useState('')
  const [amount, setAmount] = useState('')
  const [search, setSearch] = useState('')
  const [workerName, setWorkerName] = useState('')
  const [workerSalary, setWorkerSalary] = useState('15000')
  const [salaryDay, setSalaryDay] = useState('1')
  const [workerExpense, setWorkerExpense] = useState('')
  const [entryImage, setEntryImage] = useState<string>('')



  useEffect(() => {
    localStorage.setItem('shop_entries', JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    localStorage.setItem('shop_audit', JSON.stringify(audit))
  }, [audit])

  
  useEffect(() => {
  localStorage.setItem('shop_workers', JSON.stringify(workers))
  }, [workers])
  
  
  useEffect(() => {
  localStorage.setItem('shop_notices', JSON.stringify(notices))
  }, [notices])


  function login(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setOwner(name.trim())
    localStorage.setItem('shop_owner', name.trim())
  }

  function logout() {
    localStorage.removeItem('shop_owner')
    setOwner('')
  }

  function resetForm() {
    setEditing(null)
    setDate(today())
    setType('Expense')
    setDetails('')
    setAmount('')
  }

  function saveEntry(e: React.FormEvent) {
    e.preventDefault()
    if (!details.trim() || Number(amount) <= 0) return

    const time = now()

    if (editing) {
      const old = entries.find(x => x.id === editing)
      if (!old) return

      const changes = [
        old.date !== date ? `Date: ${old.date} → ${date}` : '',
        old.type !== type ? `Type: ${old.type} → ${type}` : '',
        old.details !== details ? `Details: ${old.details} → ${details}` : '',
        old.amount !== Number(amount)
          ? `Amount: ₹${old.amount} → ₹${Number(amount)}`
          : '',
      ].filter(Boolean).join('; ')

      if (!changes) {
        resetForm()
        return
      }

      setEntries(prev => prev.map(x =>
        x.id === editing
          ? { ...x, date, type, details, amount: Number(amount),
              updatedBy: owner, updatedAt: time }
          : x
      ))

      setAudit(prev => [{
        id: crypto.randomUUID(),
        entryId: editing,
        action: 'Edited',
        by: owner,
        time,
        changes,
      }, ...prev])
    } else {
      const id = crypto.randomUUID()
      setEntries(prev => [{
        id, date, type, details: details.trim(),
        amount: Number(amount), createdBy: owner,
        createdAt: time, updatedBy: '', updatedAt: '',
      }, ...prev])

      setAudit(prev => [{
        id: crypto.randomUUID(),
        entryId: id,
        action: 'Created',
        by: owner,
        time,
        changes: `${type}: ${details.trim()}, ₹${Number(amount)}`,
      }, ...prev])
    }

    resetForm()
    setPage('Transactions')
  }

  
const editEntry = (entry: Entry) => {
  setEditing(entry.id)
  setDate(entry.date)
  setType(entry.type)
  setDetails(entry.details)
  setAmount(String(entry.amount))
}

  

  if (!owner) {
    return (
      <main className="min-h-screen flex items-center justify-center p-5">
        <form onSubmit={login}
          className="bg-white rounded-2xl shadow p-7 w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold">ShopManager</h1>
          <p className="text-slate-500">Enter your name to continue</p>
          <input required value={name} onChange={e => setName(e.target.value)}
            placeholder="Owner name"
            className="border rounded-xl p-3 w-full" />
          <button className="bg-blue-600 text-white rounded-xl p-3 w-full">
            Continue
          </button>
          <p className="text-xs text-slate-500">
            Demo name selection only. Secure owner accounts will be added
            with authentication.
          </p>
        </form>
      </main>
    )
  }

  const totalExpenses = entries
    .filter(x => x.type === 'Expense')
    .reduce((sum, x) => sum + x.amount, 0)

  const totalSales = entries
    .filter(x => x.type === 'Sale')
    .reduce((sum, x) => sum + x.amount, 0)

  const filtered = entries.filter(x =>
    `${x.details} ${x.type} ${x.createdBy}`
      .toLowerCase().includes(search.toLowerCase())
  )

  const menu = ['Dashboard', 'Transactions', 'Workers & Salary', 'Entry History',  'Notice Board']

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-slate-900 text-white p-5 md:w-64">
        <h1 className="text-2xl font-bold">ShopManager</h1>
        <p className="text-slate-400 text-sm mt-1">Signed in as {owner}</p>

        <nav className="mt-6 grid grid-cols-2 md:grid-cols-1 gap-2">
          {menu.map(item => (
            <button key={item} onClick={() => setPage(item)}
              className={`p-3 rounded-xl text-left ${
                page === item ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}>
              {item}
            </button>
          ))}
          <button onClick={logout}
            className="p-3 text-left rounded-xl hover:bg-slate-800">
            Switch owner / Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-5 md:p-8 min-w-0">
        <h2 className="text-2xl font-bold mb-6">{page}</h2>

        {page === 'Dashboard' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Total Sales', totalSales],
                ['Total Expenses', totalExpenses],
                ['All Entries', entries.length],
                ['Edit History', audit.length],
              ].map(([label, value]) => (
                <div key={String(label)} className="bg-white p-5 rounded-2xl shadow-sm">
                  <p className="text-slate-500">{label}</p>
                  <p className="text-2xl font-bold mt-2">
                    {typeof value === 'number' &&
                    (label === 'Total Sales' || label === 'Total Expenses')
                      ? `₹${value.toLocaleString('en-IN')}` : value}
                  </p>
                </div>
              ))}
            </div>
            <button onClick={() => { resetForm(); setPage('Transactions') }}
              className="mt-6 bg-blue-600 text-white rounded-xl p-3">
              + Add New Entry
            </button>
          </>
        )}

        {page === 'Transactions' && (
          <>
            <form onSubmit={saveEntry}
              className="bg-white p-5 rounded-2xl shadow-sm space-y-3 mb-6">
              <h3 className="font-semibold">
                {editing ? 'Edit Entry' : 'Add New Entry'}
              </h3>

              <label className="block text-sm">Date</label>
              <input type="date" required value={date}
                onChange={e => setDate(e.target.value)}
                className="border rounded-xl p-3 w-full" />

              <label className="block text-sm">Entry Type</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="border rounded-xl p-3 w-full">
                <option>Sale</option>
                <option>Expense</option>
                <option>Purchase</option>
                <option>Worker Advance</option>
                <option>Supplier Payment</option>
                <option>Customer Payment</option>
              </select>

              <input required value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Details / worker / supplier"
                className="border rounded-xl p-3 w-full" />

              <input required type="number" min="0.01" step="0.01"
                value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="Amount in ₹"
                className="border rounded-xl p-3 w-full" />

                
<div>
  <label className="mb-2 block text-sm font-medium">
    Upload Bill / Receipt Image
  </label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > 2 * 1024 * 1024) {
        alert('Please select an image under 2 MB')
        e.target.value = ''
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setEntryImage(String(reader.result || ''))
      }
      reader.readAsDataURL(file)
    }}
    className="w-full rounded-lg border p-3"
  />

  {entryImage && (
    <div className="mt-3">
      <img
        src={entryImage}
        alt="Entry receipt preview"
        className="h-40 rounded-lg border object-contain"
      />

      <button
        type="button"
        onClick={() => setEntryImage('')}
        className="mt-2 text-sm text-red-600"
      >
        Remove Image
      </button>
    </div>
  )}
</div>


              <p className="text-sm text-slate-500">
                {editing ? 'Edited by: ' : 'Entered by: '}
                {owner} · {now()}
              </p>

              <div className="flex gap-2">
                <button className="bg-blue-600 text-white p-3 rounded-xl">
                  {editing ? 'Save Changes' : 'Save Entry'}
                </button>
                {editing && (
                  <button type="button" onClick={resetForm}
                    className="bg-slate-200 p-3 rounded-xl">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search entries..."
              className="border rounded-xl p-3 w-full mb-4" />

            <div className="space-y-3">
              {filtered.map(entry => (
                <div key={entry.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-semibold">{entry.details}</p>
                      <p className="text-sm text-slate-500">
                        {entry.date} · {entry.type}
                      </p>
                    </div>
                    <p className="font-bold">₹{entry.amount.toLocaleString('en-IN')}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Entered by {entry.createdBy} · {entry.createdAt}
                  </p>
                  {entry.updatedBy && (
                    <p className="text-xs text-slate-500 mt-1">
                      Last edited by {entry.updatedBy} · {entry.updatedAt}
                    </p>
                  )}
                 

<button
  type="button"
  onClick={() => editEntry(entry)}
  className="text-blue-600 text-sm mt-3"
>
  Edit Entry
</button>


<button
  onClick={() => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return

    setAudit(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        entryId: entry.id,
        action: 'Deleted',
        by: owner,
        time: now(),
        changes: `Deleted: ${entry.details}, Amount: ₹${entry.amount}`
      }
    ])

    setEntries(prev => prev.filter(item => item.id !== entry.id))
  }}
  className="mt-2 rounded-lg bg-red-600 px-4 py-1 text-white"
>
  Delete Entry
</button>

                </div>
              ))}
              {filtered.length === 0 &&
                <p className="text-slate-500">No entries found.</p>}
            </div>
          </>
        )}
        
{page === 'Workers & Salary' && (
  <div className="space-y-5">
    <form
      className="bg-white p-5 rounded-2xl shadow-sm space-y-3"
      onSubmit={e => {
        e.preventDefault()
        if (!workerName.trim()) return

        setWorkers(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            name: workerName.trim(),
            salary: Number(workerSalary),
            salaryDay: Number(salaryDay),
          },
        ])

        setWorkerName('')
        setWorkerSalary('15000')
        setSalaryDay('1')
      }}
    >
      <h3 className="font-semibold">Add Worker</h3>

      <input
        required
        value={workerName}
        onChange={e => setWorkerName(e.target.value)}
        placeholder="Worker name"
        className="border rounded-xl p-3 w-full"
      />

      <input
        required
        type="number"
        min="1"
        value={workerSalary}
        onChange={e => setWorkerSalary(e.target.value)}
        placeholder="Monthly salary ₹"
        className="border rounded-xl p-3 w-full"
      />

      <label className="block text-sm">Salary payment day (1–31)</label>
      <input
        required
        type="number"
        min="1"
        max="31"
        value={salaryDay}
        onChange={e => setSalaryDay(e.target.value)}
        className="border rounded-xl p-3 w-full"
      />

      <button className="bg-blue-600 text-white rounded-xl p-3">
        + Add Worker
      </button>
    </form>

    {workers.map(worker => {
      const todayDate = new Date()
      const monthStart = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        1
      ).toISOString().slice(0, 10)

      const monthEnd = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth() + 1,
        1
      ).toISOString().slice(0, 10)

      const workerEntries = entries.filter(entry =>
        entry.type === 'Worker Advance' &&
        entry.details.startsWith(worker.name + ' |') &&
        entry.date >= monthStart &&
        entry.date < monthEnd
      )

      const taken = workerEntries.reduce(
        (sum, entry) => sum + entry.amount, 0
      )

      const left = worker.salary - taken

      return (
        <div key={worker.id} className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg">{worker.name}</h3>
              <p className="text-sm text-slate-500">
                Salary day: {worker.salaryDay} of each month
              </p>
            </div>
            <button
              className="text-blue-600 text-sm"
              onClick={() => {
                const salary = prompt('Monthly salary ₹', String(worker.salary))
                if (salary === null || !Number.isFinite(Number(salary)) ||
                    Number(salary) <= 0) return

                const day = prompt('Salary day (1–31)', String(worker.salaryDay))
                if (day === null || !Number.isInteger(Number(day)) ||
                    Number(day) < 1 || Number(day) > 31) return

                setWorkers(prev => prev.map(w =>
                  w.id === worker.id
                    ? { ...w, salary: Number(salary), salaryDay: Number(day) }
                    : w
                ))
              }}
            >
              Edit salary/date
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-blue-50 p-3 rounded-xl">
              <p className="text-sm text-slate-600">Total Taken</p>
              <p className="text-xl font-bold">
                ₹{taken.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <p className="text-sm text-slate-600">Total Left</p>
              <p className="text-xl font-bold">
                ₹{left.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <p className="text-sm mt-3">
            Monthly salary: ₹{worker.salary.toLocaleString('en-IN')}
          </p>

          <form
            className="mt-4 border-t pt-4 space-y-3"
            onSubmit={e => {
              e.preventDefault()
              if (!workerExpense.trim() || Number(amount) <= 0) return

              const id = crypto.randomUUID()
              const time = now()
              const value = Number(amount)

              setEntries(prev => [{
                id,
                date: today(),
                type: 'Worker Advance',
                details: `${worker.name} | ${workerExpense.trim()}`,
                amount: value,
                createdBy: owner,
                createdAt: time,
                updatedBy: '',
                updatedAt: '',
              }, ...prev])

              setAudit(prev => [{
                id: crypto.randomUUID(),
                entryId: id,
                action: 'Created',
                by: owner,
                time,
                changes: `Worker advance: ${worker.name}, ${workerExpense.trim()}, ₹${value}`,
              }, ...prev])

              setWorkerExpense('')
              setAmount('')
            }}
          >
            <h4 className="font-semibold">Add Daily Advance / Expense</h4>
            <input
              required
              value={workerExpense}
              onChange={e => setWorkerExpense(e.target.value)}
              placeholder="Reason (e.g. personal advance)"
              className="border rounded-xl p-3 w-full"
            />
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Amount ₹"
              className="border rounded-xl p-3 w-full"
            />
            <button className="bg-blue-600 text-white rounded-xl p-3">
              Save Advance
            </button>
          </form>

          <div className="mt-4 space-y-2">
            <h4 className="font-semibold">This month's entries</h4>
            {workerEntries.map(entry => (
              


              <div key={entry.id} className="text-sm border-t pt-2">
                <div className="flex justify-between gap-2">
                  <span>{entry.date}</span>
                  <strong>₹{entry.amount.toLocaleString('en-IN')}</strong>
                </div>
                <p className="text-slate-500">{entry.details}</p>
                <button
  onClick={() => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return

    const time = now()

    setAudit(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        entryId: entry.id,
        action: 'Deleted',
        by: owner,
        time,
        changes: `Deleted entry: ${entry.details}, Amount: ₹${entry.amount}`
      }
    ])

    setEntries(prev => prev.filter(item => item.id !== entry.id))
  }}
  className="rounded-lg bg-red-100 px-3 py-2 text-red-700 hover:bg-red-200"
>
  Delete
</button>
              </div>
            ))}
          </div>
        </div>
      )
    })}
  </div>
)}

        
{page === 'Notice Board' && (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">Notice Board</h2>
      <p className="text-gray-500">
        Special requirements, staff instructions and upcoming tasks
      </p>
    </div>

    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!noticeTitle.trim() || !noticeRequirement.trim()) return

        const notice: Notice = {
          id: crypto.randomUUID(),
          title: noticeTitle.trim(),
          requirement: noticeRequirement.trim(),
          date: noticeDate,
          time: noticeTime,
          createdBy: owner,
          createdAt: now(),
          completed: false
        }

        setNotices(prev => [notice, ...prev])
        setNoticeTitle('')
        setNoticeRequirement('')
        setNoticeDate(today())
        setNoticeTime('09:00')
      }}
      className="space-y-4 rounded-xl bg-white p-5 shadow-sm"
    >
      <h3 className="text-lg font-semibold">Add New Notice</h3>

      <input
        value={noticeTitle}
        onChange={e => setNoticeTitle(e.target.value)}
        placeholder="Notice title (e.g. Special order)"
        required
        className="w-full rounded-lg border p-3"
      />

      <textarea
        value={noticeRequirement}
        onChange={e => setNoticeRequirement(e.target.value)}
        placeholder="Describe the requirement or instructions..."
        required
        className="w-full rounded-lg border p-3"
        rows={3}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Required Date</label>
          <input
            type="date"
            value={noticeDate}
            onChange={e => setNoticeDate(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">Required Time</label>
          <input
            type="time"
            value={noticeTime}
            onChange={e => setNoticeTime(e.target.value)}
            required
            className="w-full rounded-lg border p-3"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white"
      >
        + Add Notice
      </button>
    </form>

    <div className="space-y-3">
      {notices.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-gray-500">
          No notices yet. Add your first requirement above.
        </p>
      ) : (
        notices.map(notice => {
          const expired =
            !notice.completed &&
            new Date(`${notice.date}T${notice.time}`) < new Date()

          return (
            <div
              key={notice.id}
              className="rounded-xl border bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{notice.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap text-gray-600">
                    {notice.requirement}
                  </p>
                  <p className="mt-3 text-sm text-gray-500">
                    Due: {notice.date} at {notice.time}
                  </p>
                  <p className="text-xs text-gray-400">
                    Added by {notice.createdBy} · {notice.createdAt}
                  </p>
                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  notice.completed
                    ? 'bg-green-100 text-green-700'
                    : expired
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {notice.completed
                    ? 'Completed'
                    : expired
                      ? 'Expired'
                      : 'Pending'}
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setNotices(prev => prev.map(item =>
                      item.id === notice.id
                        ? { ...item, completed: !item.completed }
                        : item
                    ))
                  }
                  className="rounded-lg bg-green-100 px-3 py-2 text-green-700"
                >
                  {notice.completed ? 'Mark Pending' : 'Mark Completed'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Delete this notice?')) {
                      setNotices(prev =>
                        prev.filter(item => item.id !== notice.id)
                      )
                    }
                  }}
                  className="rounded-lg bg-red-100 px-3 py-2 text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })
      )}
    </div>
  </div>
)}


        {page === 'Entry History' && (
          <div className="space-y-3">
            {audit.map(item => (
              <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
                <p className="font-semibold">{item.action} · {item.by}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {item.time} · Entry ID: {item.entryId.slice(0, 8)}
                </p>
                <p className="text-sm mt-2 break-words">{item.changes}</p>
              </div>
            ))}
            {audit.length === 0 &&
              <p className="text-slate-500">No history yet. Add or edit an entry.</p>}
          </div>
        )}

        
      </main>
    </div>
  )
}
