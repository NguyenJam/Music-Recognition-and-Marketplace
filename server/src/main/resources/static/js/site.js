(() => {
  const recognitionForm = document.querySelector('#recognition-form');
  const resultBox = document.querySelector('#recognition-result');
  const recordButton = document.querySelector('#record-button');
  const fileInput = recognitionForm?.querySelector('input[type="file"]');
  const fileButton = document.querySelector('#file-button');
  const fileButtonLabel = document.querySelector('#file-button-label');
  const fileSelection = document.querySelector('#file-selection');
  const selectedAudioName = document.querySelector('#selected-audio-name');
  const selectedAudioDetails = document.querySelector('#selected-audio-details');
  const clearAudioButton = document.querySelector('#clear-audio');
  const languageSelect = document.querySelector('#language-select');
  const themeToggle = document.querySelector('#theme-toggle');

  const base = {
    discover: 'Discover', identify: 'Identify a track', sellRecord: 'List a record',
    darkMode: 'Dark mode', lightMode: 'Light mode', heroEyebrow: 'HEAR IT. FIND IT. KEEP IT.',
    heroLine1: 'Music finds', heroLine2: 'its way back.',
    heroIntro: 'Recognize a track from a short sample, then explore releases and listings in one place.',
    identifySong: 'Identify a song', heroFoot: 'DISCOVER SOMETHING FAMILIAR',
    recognitionEyebrow: 'A FEW SECONDS IS ENOUGH', recognitionTitle: 'What’s that song?',
    recognitionIntro: 'Upload a short clip or record a sample from your browser. We’ll look for a match and bring you back to the catalogue.',
    startSample: 'Start with a sample',
    sampleHint: 'Use a clear 5–8 second clip. The recording is not saved; recognized track details are added to the catalogue.',
    chooseAudio: 'Choose audio', changeAudio: 'Change audio', recordAudio: 'Record 8 seconds',
    findTrack: 'Find track', remove: 'Remove', readyToIdentify: 'Ready to identify',
    catalogueEyebrow: 'THE CATALOGUE', catalogueTitle: 'Follow the sound.',
    searchLabel: 'Search by title or artist', searchPlaceholder: 'Try a title or artist',
    artistLabel: 'Artist', artistPlaceholder: 'Any artist', fromYear: 'From year', toYear: 'To year',
    any: 'Any', format: 'Format', allFormats: 'All formats', filter: 'Filter', clear: 'Clear',
    unknownYear: 'Year unknown', demoOffer: 'Demo offer', oneOffer: 'offer', manyOffers: 'offers',
    noOffers: 'No offers yet. Be the first to list this release.', noReleases: 'No releases found',
    emptyHint: 'Try a wider year range or clear a filter.', seeCatalogue: 'See the full catalogue',
    demoNote: 'Demo offers are sample prices, not real inventory. Reference exchange rates are rounded for display.',
    catalogueSource: 'Search MusicBrainz’s free catalogue snapshot when it is loaded. Shazam is used separately for audio recognition.',
    footerTagline: 'Find the track. Explore the release.', buyerName: 'Your name', request: 'Request',
    preparing: 'Preparing the audio sample…', trackFound: 'Track found and saved in the catalogue.',
    noMatch: 'No match yet.', audioError: 'Could not prepare or send that audio. Try a supported audio file or record a shorter sample.',
    recordingError: 'Recording is not available in this browser. Choose an audio file instead.',
    allowMicrophone: 'Allow microphone access to record a sample, or choose an audio file.',
    recording: 'Recording… click to stop', recordAgain: 'Record 8 seconds',
    backCatalogue: '← Back to catalogue', addShelf: 'ADD TO THE SHELF', listRelease: 'List a release.',
    sellIntro: 'Choose a catalogue release and add a sample offer. This demo does not take payments or arrange delivery.',
    release: 'Release', chooseRelease: 'Choose a release', sellerName: 'Your seller name',
    sellerPlaceholder: 'e.g. Lantern Records', condition: 'Condition', priceVnd: 'Price (VND)',
    priceEntryNote: 'Enter listing prices in VND. Displayed prices are converted for browsing.',
    pricePlaceholder: 'e.g. 250000', addDemoListing: 'Add demo listing', demoMarketplace: 'DEMO MARKETPLACE',
    formatVinyl: 'Vinyl', formatCd: 'CD', formatCassette: 'Cassette', formatDigital: 'Digital',
    conditionNew: 'New', conditionLikeNew: 'Like new', conditionGood: 'Good', conditionFair: 'Fair',
    conditionIgnored: 'Condition (ignored for digital)', referenceDate: 'Reference rates: {date}'
  };

  const translations = {
    'vi-VN': {
      discover: 'Khám phá', identify: 'Nhận diện bài hát', sellRecord: 'Đăng bán đĩa', darkMode: 'Giao diện tối', lightMode: 'Giao diện sáng',
      heroEyebrow: 'NGHE THẤY. TÌM RA. LƯU LẠI.', heroLine1: 'Âm nhạc', heroLine2: 'luôn tìm về.',
      heroIntro: 'Nhận diện bài hát từ một đoạn ngắn, sau đó xem các bản phát hành và tin đăng tại cùng một nơi.', identifySong: 'Nhận diện bài hát', heroFoot: 'TÌM LẠI GIAI ĐIỆU QUEN THUỘC',
      recognitionEyebrow: 'CHỈ CẦN VÀI GIÂY', recognitionTitle: 'Bài hát này là gì?',
      recognitionIntro: 'Tải lên đoạn âm thanh ngắn hoặc ghi âm ngay trên trình duyệt để tìm bài hát trong danh mục.', startSample: 'Bắt đầu bằng một đoạn nhạc',
      sampleHint: 'Dùng đoạn nhạc rõ trong 5–8 giây. Bản ghi không được lưu; thông tin bài hát nhận diện được sẽ thêm vào danh mục.',
      chooseAudio: 'Chọn âm thanh', changeAudio: 'Đổi tệp âm thanh', recordAudio: 'Ghi âm 8 giây', findTrack: 'Tìm bài hát', remove: 'Xóa', readyToIdentify: 'Sẵn sàng nhận diện',
      catalogueEyebrow: 'DANH MỤC', catalogueTitle: 'Theo dấu giai điệu.', searchLabel: 'Tìm theo tên bài hoặc nghệ sĩ', searchPlaceholder: 'Nhập tên bài hát hoặc nghệ sĩ',
      artistLabel: 'Nghệ sĩ', artistPlaceholder: 'Mọi nghệ sĩ', fromYear: 'Từ năm', toYear: 'Đến năm', any: 'Bất kỳ', format: 'Định dạng', allFormats: 'Mọi định dạng', filter: 'Lọc', clear: 'Xóa lọc',
      unknownYear: 'Chưa rõ năm', demoOffer: 'Tin đăng mẫu', oneOffer: 'tin đăng', manyOffers: 'tin đăng', noOffers: 'Chưa có tin đăng. Hãy là người đầu tiên đăng bán bản phát hành này.',
      noReleases: 'Không tìm thấy bản phát hành', emptyHint: 'Hãy thử khoảng năm rộng hơn hoặc xóa bộ lọc.', seeCatalogue: 'Xem toàn bộ danh mục',
      demoNote: 'Tin đăng và giá là dữ liệu mẫu, không phải hàng đang bán. Tỷ giá tham khảo được làm tròn khi hiển thị.', catalogueSource: 'Khi đã tải dữ liệu, tìm kiếm sẽ gồm danh mục miễn phí MusicBrainz. Shazam được dùng riêng để nhận diện âm thanh.', footerTagline: 'Tìm bài hát. Khám phá bản phát hành.', buyerName: 'Tên của bạn', request: 'Gửi yêu cầu',
      preparing: 'Đang chuẩn bị đoạn âm thanh…', trackFound: 'Đã nhận diện và lưu bài hát vào danh mục.', noMatch: 'Chưa tìm thấy kết quả.',
      audioError: 'Không thể xử lý đoạn âm thanh. Hãy thử tệp khác hoặc ghi đoạn ngắn hơn.', recordingError: 'Trình duyệt không hỗ trợ ghi âm. Hãy chọn tệp âm thanh.',
      allowMicrophone: 'Cho phép truy cập micro để ghi âm hoặc chọn tệp âm thanh.', recording: 'Đang ghi… nhấn để dừng', recordAgain: 'Ghi âm 8 giây',
      backCatalogue: '← Về danh mục', addShelf: 'THÊM VÀO KỆ', listRelease: 'Đăng bán bản phát hành.',
      sellIntro: 'Chọn một bản phát hành và thêm tin đăng mẫu. Bản thử nghiệm không nhận thanh toán hoặc giao hàng.', release: 'Bản phát hành', chooseRelease: 'Chọn bản phát hành',
      sellerName: 'Tên người bán', sellerPlaceholder: 'VD: Lantern Records', condition: 'Tình trạng', priceVnd: 'Giá (VND)',
      priceEntryNote: 'Nhập giá tin đăng bằng VND. Giá hiển thị được quy đổi để tham khảo.', pricePlaceholder: 'VD: 250000', addDemoListing: 'Thêm tin đăng mẫu', demoMarketplace: 'CHỢ NHẠC BẢN MẪU',
      formatVinyl: 'Đĩa than', formatCd: 'CD', formatCassette: 'Băng cassette', formatDigital: 'Kỹ thuật số', conditionNew: 'Mới', conditionLikeNew: 'Như mới', conditionGood: 'Tốt', conditionFair: 'Khá',
      conditionIgnored: 'Tình trạng (không áp dụng cho bản số)', referenceDate: 'Tỷ giá tham khảo: {date}'
    },
    'es-ES': {
      discover: 'Explorar', identify: 'Identificar una canción', sellRecord: 'Vender un disco', darkMode: 'Modo oscuro', lightMode: 'Modo claro',
      heroEyebrow: 'ESCUCHA. ENCUENTRA. CONSERVA.', heroLine1: 'La música', heroLine2: 'siempre regresa.',
      heroIntro: 'Identifica una canción con un fragmento y explora ediciones y anuncios en un solo lugar.', identifySong: 'Identificar canción', heroFoot: 'DESCUBRE ALGO FAMILIAR',
      recognitionEyebrow: 'BASTAN UNOS SEGUNDOS', recognitionTitle: '¿Qué canción es?', recognitionIntro: 'Sube un fragmento breve o grábalo desde el navegador para buscar la canción.',
      startSample: 'Empieza con un fragmento', sampleHint: 'Usa un clip claro de 5–8 segundos. No guardamos la grabación; los datos de la canción se añaden al catálogo.',
      chooseAudio: 'Elegir audio', changeAudio: 'Cambiar audio', recordAudio: 'Grabar 8 segundos', findTrack: 'Buscar canción', remove: 'Quitar', readyToIdentify: 'Lista para identificar',
      catalogueEyebrow: 'EL CATÁLOGO', catalogueTitle: 'Sigue el sonido.', searchLabel: 'Buscar por título o artista', searchPlaceholder: 'Prueba un título o artista',
      artistLabel: 'Artista', artistPlaceholder: 'Cualquier artista', fromYear: 'Desde el año', toYear: 'Hasta el año', any: 'Cualquiera', format: 'Formato', allFormats: 'Todos los formatos', filter: 'Filtrar', clear: 'Borrar',
      unknownYear: 'Año desconocido', demoOffer: 'Oferta de muestra', oneOffer: 'oferta', manyOffers: 'ofertas', noOffers: 'Aún no hay ofertas. Sé el primero en publicar esta edición.', noReleases: 'No se encontraron ediciones',
      emptyHint: 'Amplía el intervalo de años o borra un filtro.', seeCatalogue: 'Ver todo el catálogo', demoNote: 'Las ofertas y los precios son de muestra, no inventario real. Los tipos de cambio se redondean.', catalogueSource: 'Al cargarlo, las búsquedas también incluyen el catálogo gratuito de MusicBrainz. Shazam se usa por separado para reconocer audio.',
      footerTagline: 'Encuentra la canción. Explora la edición.', buyerName: 'Tu nombre', request: 'Solicitar', preparing: 'Preparando el audio…',
      trackFound: 'Canción identificada y guardada en el catálogo.', noMatch: 'Aún no hay coincidencias.', audioError: 'No se pudo procesar el audio. Prueba otro archivo o un fragmento más corto.',
      recordingError: 'Este navegador no permite grabar. Elige un archivo de audio.', allowMicrophone: 'Permite el acceso al micrófono o elige un archivo de audio.', recording: 'Grabando… pulsa para detener', recordAgain: 'Grabar 8 segundos',
      backCatalogue: '← Volver al catálogo', addShelf: 'AÑADIR A LA ESTANTERÍA', listRelease: 'Publicar una edición.', sellIntro: 'Elige una edición y añade una oferta de muestra. Esta demo no procesa pagos ni entregas.',
      release: 'Edición', chooseRelease: 'Elegir edición', sellerName: 'Nombre del vendedor', sellerPlaceholder: 'p. ej., Lantern Records', condition: 'Estado', priceVnd: 'Precio (VND)', priceEntryNote: 'Introduce el precio en VND; la vista lo convierte para consultar.',
      pricePlaceholder: 'p. ej., 250000', addDemoListing: 'Añadir oferta de muestra', demoMarketplace: 'MERCADO DE DEMOSTRACIÓN', formatVinyl: 'Vinilo', formatCd: 'CD', formatCassette: 'Casete', formatDigital: 'Digital',
      conditionNew: 'Nuevo', conditionLikeNew: 'Como nuevo', conditionGood: 'Bueno', conditionFair: 'Aceptable', conditionIgnored: 'Estado (no se aplica a digital)', referenceDate: 'Tipos de referencia: {date}'
    },
    'fr-FR': {
      discover: 'Découvrir', identify: 'Identifier un morceau', sellRecord: 'Vendre un disque', darkMode: 'Mode sombre', lightMode: 'Mode clair',
      heroEyebrow: 'ÉCOUTER. TROUVER. GARDER.', heroLine1: 'La musique', heroLine2: 'finit par revenir.',
      heroIntro: 'Identifiez un morceau à partir d’un court extrait, puis explorez les éditions et les annonces au même endroit.', identifySong: 'Identifier un morceau', heroFoot: 'RETROUVER UN AIR FAMILIER',
      recognitionEyebrow: 'QUELQUES SECONDES SUFFISENT', recognitionTitle: 'Quel est ce morceau ?', recognitionIntro: 'Importez un court extrait ou enregistrez-le dans le navigateur pour trouver le morceau.',
      startSample: 'Commencer avec un extrait', sampleHint: 'Utilisez un extrait clair de 5 à 8 secondes. L’enregistrement n’est pas conservé ; les détails du morceau sont ajoutés au catalogue.',
      chooseAudio: 'Choisir un audio', changeAudio: 'Changer l’audio', recordAudio: 'Enregistrer 8 secondes', findTrack: 'Trouver le morceau', remove: 'Retirer', readyToIdentify: 'Prêt à identifier',
      catalogueEyebrow: 'LE CATALOGUE', catalogueTitle: 'Suivez le son.', searchLabel: 'Rechercher par titre ou artiste', searchPlaceholder: 'Saisissez un titre ou un artiste', artistLabel: 'Artiste', artistPlaceholder: 'Tous les artistes',
      fromYear: 'À partir de', toYear: 'Jusqu’en', any: 'Toutes', format: 'Format', allFormats: 'Tous les formats', filter: 'Filtrer', clear: 'Effacer', unknownYear: 'Année inconnue', demoOffer: 'Offre de démo',
      oneOffer: 'offre', manyOffers: 'offres', noOffers: 'Aucune offre pour le moment. Soyez le premier à proposer cette édition.', noReleases: 'Aucune édition trouvée', emptyHint: 'Élargissez la période ou effacez un filtre.', seeCatalogue: 'Voir tout le catalogue',
      demoNote: 'Les offres et prix sont des exemples, pas un stock réel. Les taux de change sont arrondis.', catalogueSource: 'Une fois chargé, le catalogue gratuit MusicBrainz sera inclus dans les recherches. Shazam reste dédié à la reconnaissance audio.', footerTagline: 'Trouvez le morceau. Explorez son édition.', buyerName: 'Votre nom', request: 'Demander', preparing: 'Préparation de l’extrait…',
      trackFound: 'Morceau identifié et ajouté au catalogue.', noMatch: 'Aucun résultat pour le moment.', audioError: 'Impossible de traiter cet audio. Essayez un autre fichier ou un extrait plus court.', recordingError: 'Ce navigateur ne permet pas l’enregistrement. Choisissez un fichier audio.',
      allowMicrophone: 'Autorisez l’accès au micro ou choisissez un fichier audio.', recording: 'Enregistrement… cliquez pour arrêter', recordAgain: 'Enregistrer 8 secondes', backCatalogue: '← Retour au catalogue',
      addShelf: 'AJOUTER À L’ÉTAGÈRE', listRelease: 'Proposer une édition.', sellIntro: 'Choisissez une édition et ajoutez une offre de démonstration. Aucun paiement ni livraison n’est effectué.', release: 'Édition', chooseRelease: 'Choisir une édition',
      sellerName: 'Nom du vendeur', sellerPlaceholder: 'ex. : Lantern Records', condition: 'État', priceVnd: 'Prix (VND)', priceEntryNote: 'Saisissez les prix en VND ; ils sont convertis pour l’affichage.', pricePlaceholder: 'ex. : 250000',
      addDemoListing: 'Ajouter une offre démo', demoMarketplace: 'MARCHÉ DE DÉMONSTRATION', formatVinyl: 'Vinyle', formatCd: 'CD', formatCassette: 'Cassette', formatDigital: 'Numérique', conditionNew: 'Neuf', conditionLikeNew: 'Comme neuf', conditionGood: 'Bon', conditionFair: 'Correct',
      conditionIgnored: 'État (sans objet pour le numérique)', referenceDate: 'Taux de référence : {date}'
    },
    'ja-JP': {
      discover: 'カタログを見る', identify: '曲を識別', sellRecord: 'レコードを出品', darkMode: 'ダークモード', lightMode: 'ライトモード',
      heroEyebrow: '聴く。見つける。残す。', heroLine1: '音楽は', heroLine2: 'また戻ってくる。', heroIntro: '短い音声から曲を識別し、作品や出品をまとめて探せます。', identifySong: '曲を識別する', heroFoot: '懐かしい音を見つける',
      recognitionEyebrow: '数秒でわかります', recognitionTitle: 'この曲は何？', recognitionIntro: '短い音声をアップロードするか、ブラウザーで録音して曲を探します。', startSample: '音声から始める',
      sampleHint: '5〜8秒の聞き取りやすい音声を使ってください。録音は保存せず、識別した曲の情報だけをカタログに追加します。', chooseAudio: '音声を選ぶ', changeAudio: '音声を変更', recordAudio: '8秒録音', findTrack: '曲を探す', remove: '削除', readyToIdentify: '識別できます',
      catalogueEyebrow: 'カタログ', catalogueTitle: '音をたどる。', searchLabel: '曲名またはアーティストで検索', searchPlaceholder: '曲名またはアーティストを入力', artistLabel: 'アーティスト', artistPlaceholder: 'すべて', fromYear: '開始年', toYear: '終了年', any: '指定なし', format: '形式', allFormats: 'すべての形式', filter: '絞り込む', clear: 'クリア',
      unknownYear: '年不明', demoOffer: 'デモ出品', oneOffer: '件の出品', manyOffers: '件の出品', noOffers: '出品はまだありません。この作品を最初に出品できます。', noReleases: '作品が見つかりません', emptyHint: '期間を広げるか、フィルターを解除してください。', seeCatalogue: 'カタログ全体を見る',
      demoNote: '価格と出品はデモ用の例で、実在の在庫ではありません。為替レートは表示用に四捨五入しています。', catalogueSource: '読み込み後は無料の MusicBrainz カタログも検索できます。Shazam は音声認識に別途使用します。', footerTagline: '曲を見つけて、作品を探す。', buyerName: 'お名前', request: 'リクエスト', preparing: '音声を準備しています…',
      trackFound: '曲を識別し、カタログに保存しました。', noMatch: '一致する曲はまだありません。', audioError: '音声を処理できません。別のファイルか短い音声をお試しください。', recordingError: 'このブラウザーでは録音できません。音声ファイルを選んでください。', allowMicrophone: '録音を許可するか、音声ファイルを選んでください。', recording: '録音中…クリックで停止', recordAgain: '8秒録音',
      backCatalogue: '← カタログに戻る', addShelf: '棚に追加', listRelease: '作品を出品する', sellIntro: '作品を選び、デモ用の出品を追加します。決済や配送は行いません。', release: '作品', chooseRelease: '作品を選択', sellerName: '販売者名', sellerPlaceholder: '例: Lantern Records', condition: '状態', priceVnd: '価格（VND）',
      priceEntryNote: '価格はVNDで入力してください。表示時に参考換算します。', pricePlaceholder: '例: 250000', addDemoListing: 'デモ出品を追加', demoMarketplace: 'デモマーケット', formatVinyl: 'レコード', formatCd: 'CD', formatCassette: 'カセット', formatDigital: 'デジタル', conditionNew: '新品', conditionLikeNew: 'ほぼ新品', conditionGood: '良好', conditionFair: '可', conditionIgnored: '状態（デジタルでは不要）',
      referenceDate: '参考為替レート: {date}'
    },
    'ko-KR': {
      discover: '둘러보기', identify: '곡 찾기', sellRecord: '음반 등록', darkMode: '다크 모드', lightMode: '라이트 모드',
      heroEyebrow: '듣고. 찾고. 간직하세요.', heroLine1: '음악은', heroLine2: '다시 돌아옵니다.', heroIntro: '짧은 음원으로 곡을 찾고 발매 정보와 판매 목록을 한곳에서 살펴보세요.', identifySong: '곡 찾기', heroFoot: '익숙한 음악을 다시 만나세요',
      recognitionEyebrow: '몇 초면 충분합니다', recognitionTitle: '이 노래 뭐지?', recognitionIntro: '짧은 음원을 업로드하거나 브라우저에서 녹음해 곡을 찾아보세요.', startSample: '음원으로 시작하기',
      sampleHint: '선명한 5~8초 음원을 사용하세요. 녹음은 저장하지 않고 인식된 곡 정보만 카탈로그에 추가합니다.', chooseAudio: '음원 선택', changeAudio: '음원 변경', recordAudio: '8초 녹음', findTrack: '곡 찾기', remove: '삭제', readyToIdentify: '인식할 준비가 됐습니다',
      catalogueEyebrow: '카탈로그', catalogueTitle: '소리를 따라가세요.', searchLabel: '곡명 또는 아티스트 검색', searchPlaceholder: '곡명이나 아티스트 입력', artistLabel: '아티스트', artistPlaceholder: '전체 아티스트', fromYear: '시작 연도', toYear: '종료 연도', any: '전체', format: '형식', allFormats: '전체 형식', filter: '필터', clear: '초기화',
      unknownYear: '연도 미상', demoOffer: '데모 판매', oneOffer: '개 판매', manyOffers: '개 판매', noOffers: '아직 판매 목록이 없습니다. 이 발매작을 처음 등록해 보세요.', noReleases: '발매작을 찾지 못했습니다', emptyHint: '연도 범위를 넓히거나 필터를 지워 보세요.', seeCatalogue: '전체 카탈로그 보기',
      demoNote: '판매 목록과 가격은 예시이며 실제 재고가 아닙니다. 환율은 표시용으로 반올림합니다.', catalogueSource: '불러온 뒤에는 무료 MusicBrainz 카탈로그도 검색할 수 있습니다. Shazam은 오디오 인식에 별도로 사용됩니다.', footerTagline: '곡을 찾고 발매작을 둘러보세요.', buyerName: '이름', request: '요청', preparing: '음원을 준비하는 중…',
      trackFound: '곡을 찾고 카탈로그에 저장했습니다.', noMatch: '아직 일치하는 곡이 없습니다.', audioError: '음원을 처리할 수 없습니다. 다른 파일이나 더 짧은 음원을 사용해 보세요.', recordingError: '이 브라우저에서는 녹음할 수 없습니다. 음원 파일을 선택하세요.', allowMicrophone: '녹음을 허용하거나 음원 파일을 선택하세요.', recording: '녹음 중… 눌러서 중지', recordAgain: '8초 녹음',
      backCatalogue: '← 카탈로그로', addShelf: '선반에 추가', listRelease: '발매작 등록', sellIntro: '발매작을 선택하고 데모 판매 목록을 추가하세요. 결제나 배송은 진행되지 않습니다.', release: '발매작', chooseRelease: '발매작 선택', sellerName: '판매자 이름', sellerPlaceholder: '예: Lantern Records', condition: '상태', priceVnd: '가격 (VND)',
      priceEntryNote: '가격은 VND로 입력합니다. 표시 가격은 참고용으로 환산됩니다.', pricePlaceholder: '예: 250000', addDemoListing: '데모 목록 추가', demoMarketplace: '데모 마켓', formatVinyl: '바이닐', formatCd: 'CD', formatCassette: '카세트', formatDigital: '디지털', conditionNew: '새 상품', conditionLikeNew: '거의 새 상품', conditionGood: '양호', conditionFair: '보통', conditionIgnored: '상태 (디지털 제외)',
      referenceDate: '참고 환율: {date}'
    },
    'zh-CN': {
      discover: '浏览', identify: '识别歌曲', sellRecord: '发布唱片', darkMode: '深色模式', lightMode: '浅色模式',
      heroEyebrow: '聆听。发现。珍藏。', heroLine1: '音乐总会', heroLine2: '再次回到身边。', heroIntro: '通过一段短音频识别歌曲，并在同一处浏览发行版本和商品。', identifySong: '识别歌曲', heroFoot: '发现熟悉的旋律',
      recognitionEyebrow: '几秒钟就够了', recognitionTitle: '这是什么歌？', recognitionIntro: '上传一段短音频，或在浏览器中录音来查找歌曲。', startSample: '从音频开始', sampleHint: '请使用清晰的 5–8 秒片段。录音不会保存，识别到的歌曲信息会加入目录。',
      chooseAudio: '选择音频', changeAudio: '更换音频', recordAudio: '录制 8 秒', findTrack: '查找歌曲', remove: '移除', readyToIdentify: '可以开始识别', catalogueEyebrow: '音乐目录', catalogueTitle: '跟随声音。',
      searchLabel: '按标题或艺人搜索', searchPlaceholder: '输入标题或艺人', artistLabel: '艺人', artistPlaceholder: '所有艺人', fromYear: '起始年份', toYear: '结束年份', any: '不限', format: '格式', allFormats: '所有格式', filter: '筛选', clear: '清除',
      unknownYear: '年份未知', demoOffer: '演示商品', oneOffer: '个商品', manyOffers: '个商品', noOffers: '暂时没有商品。你可以先发布这个版本。', noReleases: '未找到发行版本', emptyHint: '请扩大年份范围或清除筛选条件。', seeCatalogue: '查看完整目录',
      demoNote: '商品和价格仅用于演示，并非真实库存。参考汇率会四舍五入显示。', catalogueSource: '加载后，搜索也会覆盖免费的 MusicBrainz 曲库。Shazam 则单独用于音频识别。', footerTagline: '找到歌曲，探索发行版本。', buyerName: '您的姓名', request: '提交请求', preparing: '正在准备音频…',
      trackFound: '歌曲已识别并保存到目录。', noMatch: '暂未找到匹配项。', audioError: '无法处理音频。请尝试其他文件或更短的片段。', recordingError: '此浏览器无法录音，请选择音频文件。', allowMicrophone: '请允许使用麦克风，或选择音频文件。', recording: '正在录音…点击停止', recordAgain: '录制 8 秒',
      backCatalogue: '← 返回目录', addShelf: '加入唱片架', listRelease: '发布发行版本', sellIntro: '选择一个发行版本并添加演示商品。本演示不处理付款或配送。', release: '发行版本', chooseRelease: '选择发行版本', sellerName: '卖家名称', sellerPlaceholder: '例如：Lantern Records',
      condition: '品相', priceVnd: '价格（VND）', priceEntryNote: '请以 VND 输入价格，浏览时会显示换算值。', pricePlaceholder: '例如：250000', addDemoListing: '添加演示商品', demoMarketplace: '演示市场', formatVinyl: '黑胶', formatCd: 'CD', formatCassette: '磁带', formatDigital: '数字版', conditionNew: '全新', conditionLikeNew: '近全新', conditionGood: '良好', conditionFair: '一般', conditionIgnored: '品相（数字版不适用）',
      referenceDate: '参考汇率：{date}'
    }
  };

  const localeConfig = {
    'en-US': { currency: 'USD', language: 'en-US' },
    'en-GB': { currency: 'GBP', language: 'en-GB' },
    'vi-VN': { currency: 'VND', language: 'vi-VN' },
    'es-ES': { currency: 'EUR', language: 'es-ES' },
    'fr-FR': { currency: 'EUR', language: 'fr-FR' },
    'ja-JP': { currency: 'JPY', language: 'ja-JP' },
    'ko-KR': { currency: 'KRW', language: 'ko-KR' },
    'zh-CN': { currency: 'CNY', language: 'zh-CN' },
  };
  let locale = localeConfig[localStorage.getItem('melodex-locale')] ? localStorage.getItem('melodex-locale') : 'en-US';
  let messages = { ...base, ...(translations[locale] || {}) };
  let rates = { VND: 1 };
  let rateDate = '';
  let activeRecorder;
  let activeStream;
  let recordingTimer;

  const readableSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const t = (key) => messages[key] || base[key] || key;

  const applyPrices = () => {
    const currency = localeConfig[locale].currency;
    const localeName = localeConfig[locale].language;
    document.querySelectorAll('.localized-price[data-price-vnd]').forEach((element) => {
      const amountVnd = Number(element.dataset.priceVnd);
      const rate = Number(rates[currency] || 0);
      if (!Number.isFinite(amountVnd) || !rate) {
        element.textContent = `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(amountVnd))} VND`;
        return;
      }
      const rounded = Math.round(amountVnd * rate);
      if (currency === 'VND') {
        element.textContent = `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(rounded)} VND`;
      } else {
        element.textContent = new Intl.NumberFormat(localeName, {
          style: 'currency', currency, maximumFractionDigits: 0, minimumFractionDigits: 0,
        }).format(rounded);
      }
    });
    const note = document.querySelector('#rate-note');
    if (note) note.textContent = rateDate ? t('referenceDate').replace('{date}', rateDate) : '';
  };

  const translateOptions = () => {
    const formatLabels = { VINYL: 'formatVinyl', CD: 'formatCd', CASSETTE: 'formatCassette', DIGITAL: 'formatDigital' };
    const conditionLabels = { NEW: 'conditionNew', LIKE_NEW: 'conditionLikeNew', GOOD: 'conditionGood', FAIR: 'conditionFair' };
    document.querySelectorAll('select[name="format"] option').forEach((option) => {
      if (option.value && formatLabels[option.value]) option.textContent = t(formatLabels[option.value]);
    });
    document.querySelectorAll('#condition-select option').forEach((option) => {
      if (conditionLabels[option.value]) option.textContent = t(conditionLabels[option.value]);
    });
    const conditionLabel = document.querySelector('#condition-field > span');
    if (conditionLabel && document.querySelector('#format-select')?.value === 'DIGITAL') {
      conditionLabel.textContent = t('conditionIgnored');
    } else if (conditionLabel) {
      conditionLabel.textContent = t('condition');
    }
  };

  const applyLanguage = () => {
    messages = { ...base, ...(translations[locale] || {}) };
    document.documentElement.lang = locale;
    if (languageSelect) languageSelect.value = locale;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      element.placeholder = t(element.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
      element.setAttribute('aria-label', t(element.dataset.i18nAria));
    });
    document.querySelectorAll('[data-offer-count]').forEach((element) => {
      const count = Number(element.dataset.count || 0);
      element.textContent = `${count} ${count === 1 ? t('oneOffer') : t('manyOffers')}`;
    });
    translateOptions();
    if (fileInput?.files?.[0]) updateFileSelection();
    applyPrices();
    updateThemeButton();
  };

  const updateFileSelection = () => {
    const file = fileInput?.files?.[0];
    if (!file || !fileSelection || !selectedAudioName || !selectedAudioDetails) {
      if (fileSelection) fileSelection.hidden = true;
      fileButton?.classList.remove('has-file');
      if (fileButtonLabel) fileButtonLabel.textContent = t('chooseAudio');
      return;
    }
    selectedAudioName.textContent = file.name;
    selectedAudioDetails.textContent = `${readableSize(file.size)} · ${t('readyToIdentify')}`;
    fileSelection.hidden = false;
    fileButton?.classList.add('has-file');
    if (fileButtonLabel) fileButtonLabel.textContent = t('changeAudio');
  };

  const storedRates = localStorage.getItem('melodex-rates');
  if (storedRates) {
    try {
      const saved = JSON.parse(storedRates);
      if (saved.rates) rates = saved.rates;
      rateDate = saved.date || '';
    } catch (ignored) { /* Invalid stale cache will be replaced by the API response. */ }
  }

  const loadExchangeRates = async () => {
    try {
      const response = await fetch('/api/exchange-rates');
      if (!response.ok) throw new Error('Rates unavailable');
      const result = await response.json();
      if (result.rates) {
        rates = result.rates;
        rateDate = result.date || '';
        localStorage.setItem('melodex-rates', JSON.stringify({ rates, date: rateDate }));
        applyPrices();
      }
    } catch (ignored) {
      // Use the last saved reference rates; VND remains available if none were fetched.
    }
  };

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('melodex-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#181918' : '#f4f1e9';
    updateThemeButton();
  };

  function updateThemeButton() {
    if (!themeToggle) return;
    const dark = document.documentElement.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(dark));
    const label = themeToggle.querySelector('[data-i18n]');
    if (label) label.textContent = dark ? t('lightMode') : t('darkMode');
  }

  const savedTheme = localStorage.getItem('melodex-theme');
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (systemDark ? 'dark' : 'light'));
  applyLanguage();
  loadExchangeRates();

  languageSelect?.addEventListener('change', () => {
    locale = localeConfig[languageSelect.value] ? languageSelect.value : 'en-US';
    localStorage.setItem('melodex-locale', locale);
    applyLanguage();
  });
  themeToggle?.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });
  fileInput?.addEventListener('change', updateFileSelection);
  clearAudioButton?.addEventListener('click', () => {
    if (fileInput) fileInput.value = '';
    updateFileSelection();
    fileInput?.focus();
  });

  const showResult = (message, match) => {
    if (!resultBox) return;
    resultBox.replaceChildren();
    resultBox.classList.add('visible');
    const summary = document.createElement('strong');
    summary.textContent = message;
    resultBox.append(summary);
    if (match?.recognized) {
      const details = document.createElement('span');
      details.textContent = ` ${match.title} — ${match.artist}${match.releaseDate ? ` (${match.releaseDate})` : ''}`;
      resultBox.append(details);
      const link = document.createElement('a');
      link.href = `/?query=${encodeURIComponent(match.title || '')}&artist=${encodeURIComponent(match.artist || '')}#catalogue`;
      link.textContent = ` ${t('seeCatalogue')}`;
      resultBox.append(link);
    } else if (match?.message) {
      const details = document.createElement('span');
      details.textContent = ` ${match.message}`;
      resultBox.append(details);
    }
  };

  const pcmFromAudio = async (file) => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const OfflineAudioContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AudioContextClass || !OfflineAudioContextClass) throw new Error('Audio conversion is not supported in this browser.');
    const decoder = new AudioContextClass();
    try {
      const decoded = await decoder.decodeAudioData(await file.arrayBuffer());
      const seconds = Math.min(decoded.duration, 8);
      const frames = Math.max(1, Math.floor(seconds * 44100));
      const offline = new OfflineAudioContextClass(1, frames, 44100);
      const source = offline.createBufferSource();
      source.buffer = decoded;
      source.connect(offline.destination);
      source.start(0, 0, seconds);
      const rendered = await offline.startRendering();
      const samples = rendered.getChannelData(0);
      const pcm = new ArrayBuffer(samples.length * 2);
      const view = new DataView(pcm);
      for (let index = 0; index < samples.length; index += 1) {
        const sample = Math.max(-1, Math.min(1, samples[index]));
        view.setInt16(index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      }
      return pcm;
    } finally {
      await decoder.close().catch(() => {});
    }
  };

  const sendAudio = async (file) => {
    if (!file) return;
    showResult(t('preparing'));
    try {
      const pcm = await pcmFromAudio(file);
      const response = await fetch('/api/recognition', {
        method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: pcm,
      });
      const result = await response.json();
      showResult(result.recognized ? t('trackFound') : t('noMatch'), result);
    } catch (error) {
      showResult(t('audioError'));
    }
  };

  recognitionForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    sendAudio(fileInput?.files?.[0]);
  });

  const setRecordLabel = (message) => {
    const label = recordButton?.querySelector('[data-i18n]');
    if (label) label.textContent = t(message);
  };
  recordButton?.addEventListener('click', async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      showResult(t('recordingError'));
      return;
    }
    if (activeRecorder?.state === 'recording') {
      activeRecorder.stop();
      return;
    }
    try {
      activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      const recorder = new MediaRecorder(activeStream);
      activeRecorder = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = async () => {
        clearTimeout(recordingTimer);
        recordingTimer = null;
        activeStream?.getTracks().forEach((track) => track.stop());
        activeStream = null;
        setRecordLabel('recordAgain');
        const type = recorder.mimeType || 'audio/webm';
        const extension = type.includes('mp4') ? 'm4a' : 'webm';
        await sendAudio(new File(chunks, `sample.${extension}`, { type }));
      };
      recorder.start();
      setRecordLabel('recording');
      recordButton.classList.add('recording');
      recordingTimer = setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
        recordButton.classList.remove('recording');
      }, 8000);
      recorder.addEventListener('stop', () => recordButton.classList.remove('recording'), { once: true });
    } catch (error) {
      activeStream?.getTracks().forEach((track) => track.stop());
      activeStream = null;
      showResult(t('allowMicrophone'));
    }
  });

  const formatSelect = document.querySelector('#format-select');
  const conditionField = document.querySelector('#condition-field');
  const syncCondition = () => {
    if (!formatSelect || !conditionField) return;
    const digital = formatSelect.value === 'DIGITAL';
    conditionField.hidden = digital;
    const conditionSelect = conditionField.querySelector('select');
    conditionSelect.required = !digital;
    conditionSelect.disabled = digital;
    translateOptions();
  };
  formatSelect?.addEventListener('change', syncCondition);
  syncCondition();

  const WANTLIST_KEY = 'melodex-wantlist';
  const CART_KEY = 'melodex-cart';
  const BUYER_KEY = 'melodex-buyer-name';
  const safeRead = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || ''); } catch (ignored) { return fallback; }
  };
  const readWantlist = () => {
    const items = safeRead(WANTLIST_KEY, []);
    return Array.isArray(items) ? items.filter((item) => item && item.id) : [];
  };
  const readCart = () => {
    const items = safeRead(CART_KEY, []);
    return Array.isArray(items) ? items.filter((item) => item && Number(item.listingId) > 0) : [];
  };
  const writeWantlist = (items) => localStorage.setItem(WANTLIST_KEY, JSON.stringify(items));
  const writeCart = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));
  const countNodes = (selector, count) => document.querySelectorAll(selector).forEach((node) => { node.textContent = String(count); });
  const updateBuyerCounts = () => {
    countNodes('[data-want-count]', readWantlist().length);
    countNodes('[data-cart-count]', readCart().length);
  };
  const feedbackNode = document.querySelector('#market-feedback');
  let toastTimer;
  const showBuyerFeedback = (message, isError = false) => {
    let node = feedbackNode;
    if (!node) {
      node = document.querySelector('#site-feedback');
      if (!node) {
        node = document.createElement('div');
        node.id = 'site-feedback';
        node.className = 'global-feedback';
        node.setAttribute('role', 'status');
        node.setAttribute('aria-live', 'polite');
        document.body.append(node);
      }
    }
    node.textContent = message;
    node.classList.add('visible');
    node.classList.toggle('error', isError);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('visible'), 4200);
  };
  const wantItemFromButton = (button) => ({
    id: button.dataset.wantId,
    releaseId: Number(button.dataset.releaseId || 0) || null,
    title: button.dataset.title || 'Untitled recording',
    artist: button.dataset.artist || 'Unknown artist',
    release: button.dataset.release || '',
  });
  const updateWantButtons = () => {
    const ids = new Set(readWantlist().map((item) => item.id));
    document.querySelectorAll('.want-toggle[data-want-id]').forEach((button) => {
      const saved = ids.has(button.dataset.wantId);
      button.setAttribute('aria-pressed', String(saved));
      button.classList.toggle('is-saved', saved);
      const label = button.querySelector('span');
      if (label) label.textContent = saved ? 'Saved' : 'Wantlist';
    });
  };
  const toggleWantItem = (button) => {
    const item = wantItemFromButton(button);
    const items = readWantlist();
    const exists = items.some((saved) => saved.id === item.id);
    writeWantlist(exists ? items.filter((saved) => saved.id !== item.id) : [...items, item]);
    updateWantButtons();
    updateBuyerCounts();
    showBuyerFeedback(exists ? 'Removed from your wantlist.' : 'Saved to your wantlist.');
    if (document.querySelector('[data-market-view="wantlist"]')) renderWantlist();
  };
  const cartItemFromButton = (button) => ({
    listingId: Number(button.dataset.listingId),
    releaseId: Number(button.dataset.releaseId),
    title: button.dataset.title || 'Untitled release',
    artist: button.dataset.artist || 'Unknown artist',
    format: button.dataset.format || 'DIGITAL',
    condition: button.dataset.condition || 'DIGITAL',
    priceVnd: Number(button.dataset.priceVnd || 0),
    currency: button.dataset.currency || 'VND',
    seller: button.dataset.seller || 'Seller',
  });
  const addCartItem = (button) => {
    const item = cartItemFromButton(button);
    if (!item.listingId) return;
    const items = readCart();
    if (items.some((saved) => Number(saved.listingId) === item.listingId)) {
      showBuyerFeedback('That listing is already in your cart.');
      return;
    }
    items.push(item);
    writeCart(items);
    updateBuyerCounts();
    showBuyerFeedback('Added to your cart.');
    if (document.querySelector('[data-market-view="cart"]')) renderCart();
  };
  document.addEventListener('click', (event) => {
    const wantButton = event.target.closest('.want-toggle[data-want-id]');
    if (wantButton) { toggleWantItem(wantButton); return; }
    const cartButton = event.target.closest('.cart-add[data-listing-id]');
    if (cartButton) addCartItem(cartButton);
  });

  const marketViewNode = document.querySelector('.market-main[data-market-view]');
  const buyerNameInput = document.querySelector('#buyer-name');
  const buyerName = () => localStorage.getItem(BUYER_KEY) || '';
  const formatCondition = (condition) => ({ LIKE_NEW: 'Like new', NEW: 'New', GOOD: 'Good', FAIR: 'Fair', DIGITAL: 'Digital' }[condition] || condition || 'Condition unknown');
  const makeElement = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  };
  const addAction = (parent, label, className, callback) => {
    const button = makeElement('button', className, label);
    button.type = 'button';
    button.addEventListener('click', callback);
    parent.append(button);
    return button;
  };
  const emptyClientList = (container, message, linkHref, linkText) => {
    container.replaceChildren();
    const empty = makeElement('div', 'client-empty', message);
    if (linkHref && linkText) {
      const link = makeElement('a', 'client-empty-link', linkText);
      link.href = linkHref;
      empty.append(document.createElement('br'), link);
    }
    container.append(empty);
  };
  const responseJson = async (response) => {
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || result.detail || 'The request could not be completed.');
    return result;
  };
  const createListingRow = (listing, options = {}) => {
    const row = makeElement('article', 'client-row');
    const copy = makeElement('div');
    copy.append(makeElement('h3', '', `${listing.title} — ${listing.artist}`));
    copy.append(makeElement('p', '', `${listing.format ? `${listing.format} · ` : ''}${formatCondition(listing.condition)} · ${listing.seller || 'Seller'}`));
    row.append(copy);
    const actions = makeElement('div', 'client-row-actions');
    const price = makeElement('strong', 'localized-price');
    price.dataset.priceVnd = String(listing.price ?? listing.priceVnd ?? 0);
    price.textContent = `${price.dataset.priceVnd} VND`;
    actions.append(price);
    if (options.addToCart) {
      addAction(actions, 'Add to cart', 'button button-dark', () => {
        const button = document.createElement('button');
        button.dataset.listingId = String(listing.listingId);
        button.dataset.releaseId = String(listing.releaseId);
        button.dataset.title = listing.title;
        button.dataset.artist = listing.artist;
        button.dataset.format = listing.format;
        button.dataset.condition = listing.condition;
        button.dataset.priceVnd = String(listing.price ?? listing.priceVnd ?? 0);
        button.dataset.currency = listing.currency || 'VND';
        button.dataset.seller = listing.seller;
        addCartItem(button);
      });
    }
    if (options.removeWantId) {
      addAction(actions, 'Remove', 'want-toggle', () => {
        writeWantlist(readWantlist().filter((item) => item.id !== options.removeWantId));
        updateBuyerCounts();
        updateWantButtons();
        renderWantlist();
      });
    }
    row.append(actions);
    return row;
  };
  const renderWantlist = async () => {
    const container = document.querySelector('#wantlist-items');
    if (!container) return;
    const saved = readWantlist();
    if (!saved.length) {
      emptyClientList(container, 'Your wantlist is empty.', '/search', 'Find a recording to save');
      return;
    }
    const releaseIds = saved.map((item) => item.releaseId).filter(Boolean);
    let offers = [];
    if (releaseIds.length) {
      try {
        const params = new URLSearchParams({ releaseIds: releaseIds.join(','), size: '100', sort: 'price-low' });
        const result = await responseJson(await fetch(`/api/marketplace?${params}`));
        offers = result.items || [];
      } catch (error) { showBuyerFeedback(error.message, true); }
    }
    container.replaceChildren();
    saved.forEach((item) => {
      const matching = offers.filter((offer) => Number(offer.releaseId) === Number(item.releaseId));
      if (!matching.length) {
        const row = makeElement('article', 'client-row');
        const copy = makeElement('div');
        copy.append(makeElement('h3', '', `${item.title} — ${item.artist}`));
        copy.append(makeElement('p', '', item.release ? `${item.release} · No available listings yet` : 'No available listings yet'));
        row.append(copy);
        const actions = makeElement('div', 'client-row-actions');
        const search = makeElement('a', 'button button-outline', 'Search listings');
        search.href = `/marketplace?query=${encodeURIComponent(item.title)}&artist=${encodeURIComponent(item.artist)}`;
        actions.append(search);
        addAction(actions, 'Remove', 'want-toggle', () => {
          writeWantlist(readWantlist().filter((savedItem) => savedItem.id !== item.id));
          updateBuyerCounts();
          updateWantButtons();
          renderWantlist();
        });
        row.append(actions);
        container.append(row);
      } else {
        matching.forEach((offer) => container.append(createListingRow(offer, { addToCart: true, removeWantId: item.id })));
      }
    });
    applyPrices();
  };
  const renderCart = async () => {
    const container = document.querySelector('#cart-items');
    const summary = document.querySelector('#cart-summary');
    if (!container || !summary) return;
    const saved = readCart();
    if (!saved.length) {
      summary.hidden = true;
      emptyClientList(container, 'Your cart is empty.', '/marketplace', 'Browse available listings');
      return;
    }
    let available = [];
    try {
      const params = new URLSearchParams({ listingIds: saved.map((item) => item.listingId).join(','), size: '100', sort: 'newest' });
      const result = await responseJson(await fetch(`/api/marketplace?${params}`));
      available = result.items || [];
    } catch (error) { showBuyerFeedback(error.message, true); }
    const availableIds = new Set(available.map((item) => Number(item.listingId)));
    container.replaceChildren();
    saved.forEach((item) => {
      const listing = available.find((offer) => Number(offer.listingId) === Number(item.listingId));
      if (!listing) {
        const row = makeElement('article', 'client-row');
        const copy = makeElement('div');
        copy.append(makeElement('h3', '', `${item.title} — ${item.artist}`));
        copy.append(makeElement('p', '', 'This listing is no longer available. Remove it from your cart to continue.'));
        row.append(copy);
        const actions = makeElement('div', 'client-row-actions');
        addAction(actions, 'Remove', 'want-toggle', () => {
          writeCart(readCart().filter((savedItem) => Number(savedItem.listingId) !== Number(item.listingId)));
          updateBuyerCounts();
          renderCart();
        });
        row.append(actions);
        container.append(row);
      } else {
        const row = createListingRow(listing);
        addAction(row.querySelector('.client-row-actions'), 'Remove', 'want-toggle', () => {
          writeCart(readCart().filter((savedItem) => Number(savedItem.listingId) !== Number(item.listingId)));
          updateBuyerCounts();
          renderCart();
        });
        container.append(row);
      }
    });
    const subtotal = available.reduce((sum, listing) => sum + Number(listing.price || 0), 0);
    const subtotalNode = document.querySelector('#cart-subtotal');
    if (subtotalNode) subtotalNode.dataset.priceVnd = String(subtotal);
    summary.hidden = available.length === 0;
    summary.dataset.availableIds = [...availableIds].join(',');
    applyPrices();
  };
  const renderPurchases = async () => {
    const container = document.querySelector('#purchase-items');
    if (!container) return;
    const name = buyerName();
    if (!name) {
      emptyClientList(container, 'Add a buyer name in settings to view this browser’s demo requests.', '/marketplace?view=settings', 'Open buyer settings');
      return;
    }
    try {
      const params = new URLSearchParams({ buyerName: name });
      const purchases = await responseJson(await fetch(`/api/buyer/purchases?${params}`));
      if (!purchases.length) {
        emptyClientList(container, 'No purchase requests have been made under this buyer name.', '/marketplace', 'Browse available listings');
        return;
      }
      container.replaceChildren();
      purchases.forEach((purchase) => {
        const row = createListingRow(purchase);
        const requestNote = makeElement('p', 'request-status', `${purchase.status.replaceAll('_', ' ')} · ${new Date(purchase.createdAt).toLocaleString(localeConfig[locale].language)}`);
        row.querySelector('.client-row > div').append(requestNote);
        container.append(row);
      });
      applyPrices();
    } catch (error) {
      emptyClientList(container, error.message);
    }
  };

  const settingsForm = document.querySelector('#buyer-settings-form');
  if (buyerNameInput) buyerNameInput.value = buyerName();
  settingsForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = buyerNameInput?.value.trim();
    if (!name) return;
    localStorage.setItem(BUYER_KEY, name.slice(0, 120));
    showBuyerFeedback('Buyer settings saved. Purchase requests will use this name.');
  });
  document.querySelector('#checkout-button')?.addEventListener('click', async () => {
    const name = buyerName();
    if (!name) {
      showBuyerFeedback('Set your buyer name before placing a demo request.', true);
      window.location.href = '/marketplace?view=settings';
      return;
    }
    const listingIds = readCart().map((item) => Number(item.listingId));
    if (!listingIds.length) return;
    const button = document.querySelector('#checkout-button');
    button.disabled = true;
    try {
      const result = await responseJson(await fetch('/api/buyer/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerName: name, listingIds }),
      }));
      writeCart([]);
      updateBuyerCounts();
      showBuyerFeedback(`${result.message} Request${result.requestIds.length === 1 ? '' : 's'}: ${result.requestIds.join(', ')}.`);
      await renderCart();
    } catch (error) {
      showBuyerFeedback(error.message, true);
      await renderCart();
    } finally { button.disabled = false; }
  });
  updateBuyerCounts();
  updateWantButtons();
  if (marketViewNode) {
    const activeView = marketViewNode.dataset.marketView || 'all';
    document.querySelectorAll('.market-panel[data-panel], .buyer-panel[data-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.panel !== activeView;
    });
    if (activeView === 'wantlist') renderWantlist();
    if (activeView === 'cart') renderCart();
    if (activeView === 'purchases') renderPurchases();
  }
})();
