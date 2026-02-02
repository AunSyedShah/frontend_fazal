import { useEffect, useState } from 'react'
import { getStudents, createStudent, updateStudent, deleteStudent } from './api'
import { dateToTimestampSeconds, timestampSecondsToDateInput, timestampSecondsToReadable } from './utils'

function App() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({ name: '', dob: '', studentID: '' })
  const [editingId, setEditingId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getStudents()
      // Log any entries missing an id to help debug server data issues
      const missingId = data.filter((s) => s.id === undefined || s.id === null)
      if (missingId.length) {
        console.warn('Fetched students with missing id:', missingId)
        setError('Some student records are missing ids. Check server data. See console for details.')
      }
      setStudents(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        name: form.name,
        dob: dateToTimestampSeconds(form.dob), // convert to seconds
        studentID: form.studentID,
      }

      if (editingId) {
        await updateStudent(editingId, payload)
      } else {
        await createStudent(payload)
      }

      setForm({ name: '', dob: '', studentID: '' })
      setEditingId(null)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const onEdit = (student) => {
    if (!student || !student.id) {
      setError('Cannot edit this student: missing id')
      console.warn('Attempted to edit student without id', student)
      return
    }

    setForm({
      name: student.name || '',
      dob: timestampSecondsToDateInput(student.dob),
      studentID: student.studentID || '',
    })
    setEditingId(student.id)
  }

  const onDelete = async (id) => {
    if (!id) {
      setError('Cannot delete this student: missing id')
      console.warn('Attempted to delete student with undefined id')
      return
    }

    if (!confirm('Delete this student?')) return
    setLoading(true)
    setError(null)
    try {
      await deleteStudent(id)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Student Management</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Name"
              required
              className="border border-gray-300 p-2 rounded"
            />
            <input
              name="dob"
              type="date"
              value={form.dob}
              onChange={onChange}
              required
              className="border border-gray-300 p-2 rounded"
            />
            <input
              name="studentID"
              value={form.studentID}
              onChange={onChange}
              placeholder="Student ID"
              required
              className="border border-gray-300 p-2 rounded"
            />
          </div>

          <div className="mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {editingId ? 'Update Student' : 'Add Student'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setForm({ name: '', dob: '', studentID: '' })
                }}
                className="ml-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading && !students.length ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">DOB</th>
                  <th className="p-4 text-left">Student ID</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-4">{s.name}</td>
                    <td className="p-4">{timestampSecondsToReadable(s.dob)}</td>
                    <td className="p-4">{s.studentID}</td>
                    <td className="p-4">
                      <button
                        onClick={() => onEdit(s)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(s.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default App