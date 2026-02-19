'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Mail, Clock, Globe, User, Lock, AlertTriangle } from 'lucide-react'
import { useToast } from '@/components/Toast'

export default function Settings() {
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [sendTime, setSendTime] = useState('08:00')
  const [timezone, setTimezone] = useState('Asia/Seoul')
  const [saving, setSaving] = useState(false)
  const [testSending, setTestSending] = useState(false)
  const { showToast, ToastComponent } = useToast()

  // Profile state
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  // Delete state
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const user = await res.json()
          setUserId(user.id)
          setEmail(user.email)
          setProfileName(user.name || '')
          setProfileEmail(user.email || '')
          if (user.emailSettings) {
            setEnabled(user.emailSettings.enabled)
            setSendTime(user.emailSettings.sendTime)
            setTimezone(user.emailSettings.timezone)
          }
        } else {
          window.location.href = '/login'
        }
      } catch {
        window.location.href = '/login'
      }
    }
    loadUser()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, enabled, sendTime, timezone }),
      })
      if (res.ok) {
        showToast('설정이 저장되었습니다', 'success')
      } else {
        showToast('설정 저장에 실패했습니다', 'error')
      }
    } catch {
      showToast('설정 저장 중 오류가 발생했습니다', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function testDigest() {
    setTestSending(true)
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('테스트 이메일이 발송되었습니다!', 'success')
      } else {
        showToast(data.error || '이메일 발송에 실패했습니다.', 'error')
      }
    } catch {
      showToast('이메일 발송 중 오류가 발생했습니다.', 'error')
    } finally {
      setTestSending(false)
    }
  }

  async function handleSaveProfile() {
    setSavingProfile(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName, email: profileEmail }),
      })
      if (res.ok) {
        showToast('프로필이 저장되었습니다', 'success')
      } else {
        const data = await res.json().catch(() => ({}))
        showToast(data.message || '프로필 저장에 실패했습니다', 'error')
      }
    } catch {
      showToast('프로필 저장 중 오류가 발생했습니다', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 6) {
      showToast('새 비밀번호는 최소 6자 이상이어야 합니다', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showToast('새 비밀번호가 일치하지 않습니다', 'error')
      return
    }
    setSavingPassword(true)
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        showToast(data.message || '비밀번호가 변경되었습니다', 'success')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        showToast(data.message || '비밀번호 변경에 실패했습니다', 'error')
      }
    } catch {
      showToast('비밀번호 변경 중 오류가 발생했습니다', 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      '정말로 계정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.'
    )
    if (!confirmed) return
    setDeletingAccount(true)
    try {
      const res = await fetch('/api/auth/delete', { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.success) {
        showToast(data.message || '계정이 삭제되었습니다', 'success')
        setTimeout(() => {
          window.location.href = '/'
        }, 1500)
      } else {
        showToast(data.message || '계정 삭제에 실패했습니다', 'error')
        setDeletingAccount(false)
      }
    } catch {
      showToast('계정 삭제 중 오류가 발생했습니다', 'error')
      setDeletingAccount(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">설정</h1>
        <p className="mt-1 text-gray-600">이메일 브리핑 설정을 관리합니다.</p>
      </div>

      {/* Section 1: Email briefing settings */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold">이메일 브리핑 설정</h2>
        </div>

        <div className="space-y-6 p-6">
          {/* Email */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail className="h-4 w-4" />
              수신 이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100"
            />
          </div>

          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">모닝 브리핑 활성화</p>
              <p className="text-xs text-gray-500">매일 아침 주식 뉴스 분석 이메일을 받습니다.</p>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Send Time */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              발송 시간
            </label>
            <select
              value={sendTime}
              onChange={(e) => setSendTime(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100"
            >
              <option value="07:00">오전 7:00</option>
              <option value="07:30">오전 7:30</option>
              <option value="08:00">오전 8:00</option>
              <option value="08:30">오전 8:30</option>
              <option value="09:00">오전 9:00</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Globe className="h-4 w-4" />
              시간대
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100"
            >
              <option value="Asia/Seoul">한국 (KST, UTC+9)</option>
              <option value="America/New_York">미국 동부 (EST)</option>
              <option value="America/Los_Angeles">미국 서부 (PST)</option>
              <option value="Europe/London">영국 (GMT)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <button
            onClick={testDigest}
            disabled={testSending}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            {testSending && <Loader2 className="h-4 w-4 animate-spin" />}
            테스트 이메일 발송
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                저장
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section 2: Account settings */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold">계정 설정</h2>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4" />
              이름
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail className="h-4 w-4" />
              이메일
            </label>
            <input
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {savingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                프로필 저장
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section 3: Security */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold">보안</h2>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Lock className="h-4 w-4" />
              현재 비밀번호
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호를 입력하세요"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Lock className="h-4 w-4" />
              새 비밀번호
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호를 입력하세요 (최소 6자)"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Lock className="h-4 w-4" />
              새 비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호를 다시 입력하세요"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100"
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {savingPassword ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Lock className="h-4 w-4" />
                비밀번호 변경
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section 4: Danger zone */}
      <div className="rounded-2xl border border-red-200 bg-white shadow-sm">
        <div className="border-b border-red-100 px-6 py-4">
          <h2 className="flex items-center gap-2 font-semibold text-red-600">
            <AlertTriangle className="h-4 w-4" />
            계정 삭제
          </h2>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-sm text-gray-600">
            계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <p className="text-sm text-gray-500">
            삭제되는 항목: 프로필 정보, 관심 종목, 이메일 설정, 모든 브리핑 기록
          </p>
        </div>

        <div className="flex justify-end border-t border-red-100 px-6 py-4">
          <button
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {deletingAccount ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                계정 삭제
              </>
            )}
          </button>
        </div>
      </div>

      {ToastComponent}
    </div>
  )
}
