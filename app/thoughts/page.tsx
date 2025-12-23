import Link from "next/link";

export default function ThoughtsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← 홈으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">짧은생각</h1>
          <p className="mt-2 text-lg text-gray-600">
            복지 현장의 단상과 인사이트
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 검색 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <input
            type="text"
            placeholder="키워드 검색..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* 콘텐츠 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="mb-4">
              <div className="w-full h-40 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                단상
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              사회문제는 사회구조로 보면서 사회복지사는 개인적으로?
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              사회문제를 다루는 분들은 주로 사회문제가 사회구조에서 기인한다고 설명한다...
            </p>
            <div className="text-sm text-gray-500">
              2024-12-15
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="mb-4">
              <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                단상
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              사회사업 안에 이미 내장된 것들인데…
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              사회사업(social work)을 배울 때, 우리는 생태체계 이론을 접한다...
            </p>
            <div className="text-sm text-gray-500">
              2024-12-12
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="mb-4">
              <div className="w-full h-40 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                단상
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              격변기는 혼란인 동시에 변화의 타이밍
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              아무리 좋은 변화를 추구하더라도 그 시기가 맞지 않으면 좌초된다...
            </p>
            <div className="text-sm text-gray-500">
              2024-12-10
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="mb-4">
              <div className="w-full h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                단상
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              저에게 AI는 사회사업 본질에 집중하기 위한 도구일 뿐
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              AI, 노코드 도구가 쏟아지지만, 저는 일단 저런 게 있네 하며 가볍게 살피고 넘겨요...
            </p>
            <div className="text-sm text-gray-500">
              2024-12-08
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="mb-4">
              <div className="w-full h-40 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                단상
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              무엇을 하고 싶다는 사람에게
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              무엇을 하고 싶다는 사람에게 그래서 지금 뭘 하고 있나요?...
            </p>
            <div className="text-sm text-gray-500">
              2024-12-05
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="mb-4">
              <div className="w-full h-40 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                단상
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              방향은 앞다퉈 밝히지만
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              방향은 앞다퉈 밝히지만 방법은 거기에 못 미친다...
            </p>
            <div className="text-sm text-gray-500">
              2024-12-03
            </div>
          </div>
        </div>

        {/* 페이지네이션 */}
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <button className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-l-md">
              이전
            </button>
            <button className="px-4 py-2 border-t border-b border-gray-300 bg-purple-600 text-sm font-medium text-white">
              1
            </button>
            <button className="px-4 py-2 border-t border-b border-r border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              2
            </button>
            <button className="px-4 py-2 border-t border-b border-r border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              3
            </button>
            <button className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-r-md">
              다음
            </button>
          </nav>
        </div>
      </main>
    </div>
  );
}
