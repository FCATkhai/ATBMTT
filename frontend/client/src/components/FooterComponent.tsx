function FooterComponent() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-10 font-bold">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo / Tên */}
        <div className="text-lg font-semibold text-white">
          MyVotingApp © {new Date().getFullYear()}
        </div>

        {/* Liên kết */}
        <div className="flex gap-6 text-sm">
          <a href="/about" className="hover:text-white transition-colors">Về chúng tôi</a>
          <a href="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</a>
          <a href="/contact" className="hover:text-white transition-colors">Liên hệ</a>
        </div>

        {/* Mạng xã hội */}
        <div className="flex gap-4">
          <a href="https://facebook.com" target="_blank" className="hover:text-white transition-colors">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://twitter.com" target="_blank" className="hover:text-white transition-colors">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://github.com" target="_blank" className="hover:text-white transition-colors">
            <i className="fab fa-github"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default FooterComponent;
