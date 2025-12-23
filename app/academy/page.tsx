import Link from "next/link";

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← 홈으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">학술</h1>
          <p className="mt-2 text-lg text-gray-600">
            국내외 최신 논문 요약 및 에디터 분석
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="키워드 검색..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>전체</option>
              <option>최신순</option>
              <option>인기순</option>
            </select>
          </div>
        </div>

        {/* 콘텐츠 리스트 (샘플) */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-48 h-32 bg-gray-200 rounded-lg mr-6"></div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  연구자가 현장에 들어가야 진짜 도움되는 해결책 나와
                </h3>
                <p className="text-gray-600 mb-4">
                  연구자는 현장에 도움을 주고자 이론과 대안을 마련합니다. 그런데 현재 진행되는 방식은 주로 조직 밖에서 연구자가 관찰한 데이터를 활용하는 방식입니다...
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>2024-12-20</span>
                  <span className="mx-2">•</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">학술</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-48 h-32 bg-gray-200 rounded-lg mr-6"></div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  사회사업이 추구하는 혁신은 작은 것이 아름다운 [절약형 혁신]
                </h3>
                <p className="text-gray-600 mb-4">
                  혁신을 추구해야 한다는 말을 많이 듣습니다. 보통 혁신 하면 대규모, 대형, 복잡, 고비용 등이 떠오르지요...
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>2024-12-18</span>
                  <span className="mx-2">•</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">학술</span>
                </div>
              </div>
            </div>
          </div>

          {/* 더 많은 항목들... */}
        </div>

        {/* 페이지네이션 */}
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <button className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-l-md">
              이전
            </button>
            <button className="px-4 py-2 border-t border-b border-gray-300 bg-blue-600 text-sm font-medium text-white">
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
