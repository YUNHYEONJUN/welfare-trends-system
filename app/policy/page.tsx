import Link from "next/link";

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
            ← 홈으로
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">정책</h1>
          <p className="mt-2 text-lg text-gray-600">
            복지부, 경기도, 31개 시군의 정책 동향
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
              <option>전체 지역</option>
              <option>보건복지부</option>
              <option>경기도</option>
              <option>서울시</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
              <option>최신순</option>
              <option>인기순</option>
            </select>
          </div>
        </div>

        {/* 콘텐츠 리스트 (샘플) */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="mb-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                보건복지부
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              푸드마켓 인프라 활용하는 그냥드림 시범사업
            </h3>
            <p className="text-gray-600 mb-4">
              보건복지부가 올해 12월부터 푸드마켓 인프라를 활용한 '그냥드림' 시범사업을 진행중입니다. 생계가 어려운 경우, 기본적인 먹거리·생필품을 1인당 2만원 한도까지...
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <span>2024-12-22</span>
                <span className="mx-2">•</span>
                <span>에디터: 박선우</span>
              </div>
              <Link href="#" className="text-green-600 hover:text-green-800 font-medium">
                자세히 보기 →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="mb-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                경기도
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              통합돌봄 관련 민간복지기관의 사회서비스정보시스템 활용 가능
            </h3>
            <p className="text-gray-600 mb-4">
              국무회의에서 「사회보장급여법 시행령」 일부가 개정되었습니다. 현장과 관련된 부분은 노인복지관, 지역자활센터 등 통합돌봄 지원 관련기관이...
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <span>2024-12-20</span>
                <span className="mx-2">•</span>
                <span>에디터: 박선우</span>
              </div>
              <Link href="#" className="text-green-600 hover:text-green-800 font-medium">
                자세히 보기 →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div className="mb-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                서울시
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              법인 및 복지시설 공시정보 특히 업무추진비까지 공개
            </h3>
            <p className="text-gray-600 mb-4">
              서울시가 서울복지포털을 대폭 개편했습니다. 이 가운데 서울 소재 사회복지 법인 및 복지시설의 공시정보를 주요 개편 내용으로 소개했습니다...
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <span>2024-12-19</span>
                <span className="mx-2">•</span>
                <span>에디터: 박선우</span>
              </div>
              <Link href="#" className="text-green-600 hover:text-green-800 font-medium">
                자세히 보기 →
              </Link>
            </div>
          </div>
        </div>

        {/* 페이지네이션 */}
        <div className="mt-8 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <button className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-l-md">
              이전
            </button>
            <button className="px-4 py-2 border-t border-b border-gray-300 bg-green-600 text-sm font-medium text-white">
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
