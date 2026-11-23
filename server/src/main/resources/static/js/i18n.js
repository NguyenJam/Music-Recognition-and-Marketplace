(() => {
  const base = {
    discover: 'Discover', identify: 'Identify a track', sellRecord: 'List a record', menu: 'Menu',
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
    unknownYear: 'Year unknown', oneOffer: 'offer', manyOffers: 'offers',
    noOffers: 'No listings yet. Be the first to offer this release.', noListingsYet: 'No listings yet.', listingsAvailable: 'Listings available.', noReleases: 'No releases found',
    emptyHint: 'Try a wider year range or clear a filter.', seeCatalogue: 'See the track catalogue',
    footerTagline: 'Find the track. Explore the release.', buyerName: 'Your name', request: 'Request',
    preparing: 'Preparing the audio sample…', trackFound: 'Track found and saved in the catalogue.',
    noMatch: 'No match yet.', audioError: 'Could not prepare or send that audio. Try a supported audio file or record a shorter sample.',
    recordingError: 'Recording is not available in this browser. Choose an audio file instead.',
    allowMicrophone: 'Allow microphone access to record a sample, or choose an audio file.',
    recording: 'Recording… click to stop', recordAgain: 'Record 8 seconds',
    backCatalogue: '← Back to catalogue', addShelf: 'ADD TO THE SHELF', listRelease: 'List a release.',
    sellIntro: 'Choose a catalogue release and add your listing.',
    release: 'Release', chooseRelease: 'Choose a release', sellerName: 'Your seller name',
    sellerPlaceholder: 'e.g. Lantern Records', condition: 'Condition', priceVnd: 'Price (VND)',
    priceEntryNote: 'Enter listing prices in VND. Displayed prices are converted for browsing.',
    pricePlaceholder: 'e.g. 250000', addDemoListing: 'Add listing',
    formatVinyl: 'Vinyl', formatCd: 'CD', formatCassette: 'Cassette', formatDigital: 'Digital',
    conditionNew: 'New', conditionLikeNew: 'Like new', conditionGood: 'Good', conditionFair: 'Fair',
    conditionIgnored: 'Condition (ignored for digital)'
  };

  Object.assign(base, {
    trackCatalogueNav: 'Track catalogue', shopRecords: 'Shop records', heroAnnotation: 'MUSIC TO SHELF', heroChapter: '01 / LISTEN',
    shopAvailable: 'Shop available listings', shopAvailableHint: 'Only records with a seller offer', recordingsToSearch: 'known tracks',
    marketEyebrow: 'MELODEX MARKETPLACE', marketTitle: 'Find your next record.', marketIntro: 'Browse tracks already known to Melodex, or shop records with an active seller offer.',
    catalogueTab: 'Catalogue', availableOffers: 'Available offers', itemsIWant: 'Items I want', savedSearches: 'Saved searches', myCollection: 'My collection', purchases: 'Purchases', cart: 'Cart', buyerSettings: 'Buyer settings',
    trackCatalogueHeading: 'Track catalogue', catalogueCountSuffix: 'known tracks in the Melodex catalogue. Seller offers are shown separately.', knownTrack: 'KNOWN TRACK', searchKnownTracks: 'Search the local catalogue, save the track, or check for another seller offer.', browseCurrentOffers: 'Browse current offers',
    trackTitle: 'Track title', searchSong: 'Search a song', searchArtist: 'Search an artist', searchCatalogue: 'Search catalogue',
    allRecordings: 'All known tracks', searchResultsPage: 'Search results · page', listView: 'List', gridView: 'Grid', activeOffer: 'active offer', activeOffers: 'active offers', fromPrice: 'from', noActiveOffer: 'No active seller offer', wantlist: 'Wantlist', collection: 'Collection', checkListings: 'Check listings', noCatalogueMatches: 'No catalogue matches', tryDifferentSearch: 'Try a different search.', browseCatalogue: 'Browse the catalogue', previous: 'Previous', next: 'Next', page: 'Page', entriesShown: 'entries shown',
    availableListings: 'Available listings', itemsMatchFilters: 'items match your filters', clearFilters: 'Clear filters', search: 'Search', titleArtistOrSeller: 'Title, artist, or seller', searchListings: 'Search listings', anyArtist: 'Any artist', condition: 'Condition', anyCondition: 'Any condition', priceRange: 'Price range', min: 'Min', max: 'Max', noLimit: 'No limit', releaseYear: 'Release year', from: 'From', to: 'To', seller: 'Seller', sellerNameLabel: 'Seller name', anySeller: 'Any seller', applyFilters: 'Apply filters', saveThisSearch: 'Save this search', sortBy: 'Sort by', sortListings: 'Sort listings', recentlyListed: 'Recently listed', priceLowToHigh: 'Price: low to high', priceHighToLow: 'Price: high to low', title: 'Title', yearNewest: 'Year: newest', sort: 'Sort', addToCart: 'Add to cart', noListingsMatch: 'No listings match these filters', widenOfferFilters: 'Try a wider price range or choose another format.', showAvailableOffers: 'Show all available offers', of: 'of',
    wantlistDescription: 'Saved in this browser. Available offers are shown when they exist.', savedSearchesDescription: 'Keep filter combinations in this browser and reopen them later.', collectionDescription: 'Keep a personal shelf of catalogue entries in this browser.', yourCart: 'Your cart', cartDescription: 'Review and submit your selected listings.', subtotal: 'Subtotal', submitOrderRequest: 'Submit order request', cartSubmitNote: 'Submitting records a request for these listings.', purchaseRequests: 'Order requests', purchaseRequestsDescription: 'Requests saved under your buyer name.', buyerSettingsDescription: 'Use your name to view your order request history.', buyerNameLabel: 'Buyer name', buyerNamePlaceholder: 'Enter your buyer name', saveSettings: 'Save settings', buyerPrivacyNote: 'Your name is used to find your order request history.', buyerTools: 'BUYER TOOLS', admin: 'Admin',
    alreadyInCart: 'That listing is already in your cart.', addedToCart: 'Added to your cart.', alreadySaved: 'That search is already saved.', savedSearchFeedback: 'Search saved in this browser.', remove: 'Remove', addToCartAction: 'Add to cart',
    emptyWantlist: 'Your wantlist is empty.', findRecordingToSave: 'Find a recording to save', noAvailableListingsYet: 'No available listings yet', searchListingsAction: 'Search listings', noSavedSearches: 'No searches saved yet.', filterAvailableOffers: 'Filter available offers', openSearch: 'Open search', emptyCollection: 'Your collection is empty.', browseCatalogueAction: 'Browse the catalogue', checkOffers: 'Check offers', emptyCart: 'Your cart is empty.', browseAvailableListings: 'Browse available listings', listingUnavailable: 'This listing is no longer available. Remove it from your cart to continue.', buyerNameNeeded: 'Add a buyer name in settings to view order requests.', openBuyerSettings: 'Open buyer settings', noPurchaseRequests: 'No order requests have been made under this buyer name.', buyerSettingsSaved: 'Buyer settings saved. Requests will use this name.', setBuyerNameFirst: 'Set your buyer name before submitting an order request.',
    items: 'items', recordings: 'recordings', seeMore: 'See more'
  });
  Object.assign(base, {
    mainNavigation: 'Main navigation', languageCurrency: 'Language and currency', catalogueLayout: 'Catalogue layout',
    wantMoreRecordings: 'Looking for a recording that is not listed for sale?',
    searchTrackCatalogue: 'Search track catalogue',
    saved: 'Saved', inCollection: 'In collection', removedFromWantlist: 'Removed from your wantlist.',
    savedToWantlist: 'Saved to your wantlist.', removedFromCollection: 'Removed from your collection.',
    addedToCollection: 'Added to your collection.', conditionUnknown: 'Condition unknown',
    orderRequestRecorded: 'Your order request was received. Reference:',
    requestCouldNotComplete: 'The request could not be completed. Please try again.',
    activeMarketplaceListings: 'available listings',
    seeAllListings: 'See all listings', homeCatalogueEmpty: 'Recognized tracks will appear here.',
    homeOffersEmpty: 'You can still explore the complete track catalogue.', seeRelease: 'View track', viewOffer: 'View offer'
  });

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
      unknownYear: 'Chưa rõ năm', oneOffer: 'tin đăng', manyOffers: 'tin đăng', noOffers: 'Chưa có tin đăng. Hãy là người đầu tiên đăng bán bản phát hành này.',
      noReleases: 'Không tìm thấy bản phát hành', emptyHint: 'Hãy thử khoảng năm rộng hơn hoặc xóa bộ lọc.', seeCatalogue: 'Xem danh mục bài hát', footerTagline: 'Tìm bài hát. Khám phá bản phát hành.', buyerName: 'Tên của bạn', request: 'Gửi yêu cầu',
      preparing: 'Đang chuẩn bị đoạn âm thanh…', trackFound: 'Đã nhận diện và lưu bài hát vào danh mục.', noMatch: 'Chưa tìm thấy kết quả.',
      audioError: 'Không thể xử lý đoạn âm thanh. Hãy thử tệp khác hoặc ghi đoạn ngắn hơn.', recordingError: 'Trình duyệt không hỗ trợ ghi âm. Hãy chọn tệp âm thanh.',
      allowMicrophone: 'Cho phép truy cập micro để ghi âm hoặc chọn tệp âm thanh.', recording: 'Đang ghi… nhấn để dừng', recordAgain: 'Ghi âm 8 giây',
      backCatalogue: '← Về danh mục', addShelf: 'THÊM VÀO KỆ', listRelease: 'Đăng bán bản phát hành.',
      sellIntro: 'Chọn một bản phát hành và thêm tin đăng mẫu. Bản thử nghiệm không nhận thanh toán hoặc giao hàng.', release: 'Bản phát hành', chooseRelease: 'Chọn bản phát hành',
      sellerName: 'Tên người bán', sellerPlaceholder: 'VD: Lantern Records', condition: 'Tình trạng', priceVnd: 'Giá (VND)',
      priceEntryNote: 'Nhập giá tin đăng bằng VND. Giá hiển thị được quy đổi để tham khảo.', pricePlaceholder: 'VD: 250000', addDemoListing: 'Thêm tin đăng mẫu',
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
      unknownYear: 'Año desconocido', oneOffer: 'oferta', manyOffers: 'ofertas', noOffers: 'Aún no hay ofertas. Sé el primero en publicar esta edición.', noReleases: 'No se encontraron ediciones',
      emptyHint: 'Amplía el intervalo de años o borra un filtro.', seeCatalogue: 'Ver el catálogo de canciones',
      footerTagline: 'Encuentra la canción. Explora la edición.', buyerName: 'Tu nombre', request: 'Solicitar', preparing: 'Preparando el audio…',
      trackFound: 'Canción identificada y guardada en el catálogo.', noMatch: 'Aún no hay coincidencias.', audioError: 'No se pudo procesar el audio. Prueba otro archivo o un fragmento más corto.',
      recordingError: 'Este navegador no permite grabar. Elige un archivo de audio.', allowMicrophone: 'Permite el acceso al micrófono o elige un archivo de audio.', recording: 'Grabando… pulsa para detener', recordAgain: 'Grabar 8 segundos',
      backCatalogue: '← Volver al catálogo', addShelf: 'AÑADIR A LA ESTANTERÍA', listRelease: 'Publicar una edición.', sellIntro: 'Elige una edición y añade una oferta de muestra. Esta demo no procesa pagos ni entregas.',
      release: 'Edición', chooseRelease: 'Elegir edición', sellerName: 'Nombre del vendedor', sellerPlaceholder: 'p. ej., Lantern Records', condition: 'Estado', priceVnd: 'Precio (VND)', priceEntryNote: 'Introduce el precio en VND; la vista lo convierte para consultar.',
      pricePlaceholder: 'p. ej., 250000', addDemoListing: 'Añadir oferta de muestra', formatVinyl: 'Vinilo', formatCd: 'CD', formatCassette: 'Casete', formatDigital: 'Digital',
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
      fromYear: 'À partir de', toYear: 'Jusqu’en', any: 'Toutes', format: 'Format', allFormats: 'Tous les formats', filter: 'Filtrer', clear: 'Effacer', unknownYear: 'Année inconnue',
      oneOffer: 'offre', manyOffers: 'offres', noOffers: 'Aucune offre pour le moment. Soyez le premier à proposer cette édition.', noReleases: 'Aucune édition trouvée', emptyHint: 'Élargissez la période ou effacez un filtre.', seeCatalogue: 'Voir le catalogue des titres', footerTagline: 'Trouvez le morceau. Explorez son édition.', buyerName: 'Votre nom', request: 'Demander', preparing: 'Préparation de l’extrait…',
      trackFound: 'Morceau identifié et ajouté au catalogue.', noMatch: 'Aucun résultat pour le moment.', audioError: 'Impossible de traiter cet audio. Essayez un autre fichier ou un extrait plus court.', recordingError: 'Ce navigateur ne permet pas l’enregistrement. Choisissez un fichier audio.',
      allowMicrophone: 'Autorisez l’accès au micro ou choisissez un fichier audio.', recording: 'Enregistrement… cliquez pour arrêter', recordAgain: 'Enregistrer 8 secondes', backCatalogue: '← Retour au catalogue',
      addShelf: 'AJOUTER À L’ÉTAGÈRE', listRelease: 'Proposer une édition.', sellIntro: 'Choisissez une édition et ajoutez une offre de démonstration. Aucun paiement ni livraison n’est effectué.', release: 'Édition', chooseRelease: 'Choisir une édition',
      sellerName: 'Nom du vendeur', sellerPlaceholder: 'ex. : Lantern Records', condition: 'État', priceVnd: 'Prix (VND)', priceEntryNote: 'Saisissez les prix en VND ; ils sont convertis pour l’affichage.', pricePlaceholder: 'ex. : 250000',
      addDemoListing: 'Ajouter une offre démo', formatVinyl: 'Vinyle', formatCd: 'CD', formatCassette: 'Cassette', formatDigital: 'Numérique', conditionNew: 'Neuf', conditionLikeNew: 'Comme neuf', conditionGood: 'Bon', conditionFair: 'Correct',
      conditionIgnored: 'État (sans objet pour le numérique)', referenceDate: 'Taux de référence : {date}'
    },
    'ja-JP': {
      discover: 'カタログを見る', identify: '曲を識別', sellRecord: 'レコードを出品', darkMode: 'ダークモード', lightMode: 'ライトモード',
      heroEyebrow: '聴く。見つける。残す。', heroLine1: '音楽は', heroLine2: 'また戻ってくる。', heroIntro: '短い音声から曲を識別し、作品や出品をまとめて探せます。', identifySong: '曲を識別する', heroFoot: '懐かしい音を見つける',
      recognitionEyebrow: '数秒でわかります', recognitionTitle: 'この曲は何？', recognitionIntro: '短い音声をアップロードするか、ブラウザーで録音して曲を探します。', startSample: '音声から始める',
      sampleHint: '5〜8秒の聞き取りやすい音声を使ってください。録音は保存せず、識別した曲の情報だけをカタログに追加します。', chooseAudio: '音声を選ぶ', changeAudio: '音声を変更', recordAudio: '8秒録音', findTrack: '曲を探す', remove: '削除', readyToIdentify: '識別できます',
      catalogueEyebrow: 'カタログ', catalogueTitle: '音をたどる。', searchLabel: '曲名またはアーティストで検索', searchPlaceholder: '曲名またはアーティストを入力', artistLabel: 'アーティスト', artistPlaceholder: 'すべて', fromYear: '開始年', toYear: '終了年', any: '指定なし', format: '形式', allFormats: 'すべての形式', filter: '絞り込む', clear: 'クリア',
      unknownYear: '年不明', oneOffer: '件の出品', manyOffers: '件の出品', noOffers: '出品はまだありません。この作品を最初に出品できます。', noReleases: '作品が見つかりません', emptyHint: '期間を広げるか、フィルターを解除してください。', seeCatalogue: '曲のカタログを見る', footerTagline: '曲を見つけて、作品を探す。', buyerName: 'お名前', request: 'リクエスト', preparing: '音声を準備しています…',
      trackFound: '曲を識別し、カタログに保存しました。', noMatch: '一致する曲はまだありません。', audioError: '音声を処理できません。別のファイルか短い音声をお試しください。', recordingError: 'このブラウザーでは録音できません。音声ファイルを選んでください。', allowMicrophone: '録音を許可するか、音声ファイルを選んでください。', recording: '録音中…クリックで停止', recordAgain: '8秒録音',
      backCatalogue: '← カタログに戻る', addShelf: '棚に追加', listRelease: '作品を出品する', sellIntro: '作品を選び、デモ用の出品を追加します。決済や配送は行いません。', release: '作品', chooseRelease: '作品を選択', sellerName: '販売者名', sellerPlaceholder: '例: Lantern Records', condition: '状態', priceVnd: '価格（VND）',
      priceEntryNote: '価格はVNDで入力してください。表示時に参考換算します。', pricePlaceholder: '例: 250000', addDemoListing: 'デモ出品を追加', formatVinyl: 'レコード', formatCd: 'CD', formatCassette: 'カセット', formatDigital: 'デジタル', conditionNew: '新品', conditionLikeNew: 'ほぼ新品', conditionGood: '良好', conditionFair: '可', conditionIgnored: '状態（デジタルでは不要）',
      referenceDate: '参考為替レート: {date}'
    },
    'ko-KR': {
      discover: '둘러보기', identify: '곡 찾기', sellRecord: '음반 등록', darkMode: '다크 모드', lightMode: '라이트 모드',
      heroEyebrow: '듣고. 찾고. 간직하세요.', heroLine1: '음악은', heroLine2: '다시 돌아옵니다.', heroIntro: '짧은 음원으로 곡을 찾고 발매 정보와 판매 목록을 한곳에서 살펴보세요.', identifySong: '곡 찾기', heroFoot: '익숙한 음악을 다시 만나세요',
      recognitionEyebrow: '몇 초면 충분합니다', recognitionTitle: '이 노래 뭐지?', recognitionIntro: '짧은 음원을 업로드하거나 브라우저에서 녹음해 곡을 찾아보세요.', startSample: '음원으로 시작하기',
      sampleHint: '선명한 5~8초 음원을 사용하세요. 녹음은 저장하지 않고 인식된 곡 정보만 카탈로그에 추가합니다.', chooseAudio: '음원 선택', changeAudio: '음원 변경', recordAudio: '8초 녹음', findTrack: '곡 찾기', remove: '삭제', readyToIdentify: '인식할 준비가 됐습니다',
      catalogueEyebrow: '카탈로그', catalogueTitle: '소리를 따라가세요.', searchLabel: '곡명 또는 아티스트 검색', searchPlaceholder: '곡명이나 아티스트 입력', artistLabel: '아티스트', artistPlaceholder: '전체 아티스트', fromYear: '시작 연도', toYear: '종료 연도', any: '전체', format: '형식', allFormats: '전체 형식', filter: '필터', clear: '초기화',
      unknownYear: '연도 미상', oneOffer: '개 판매', manyOffers: '개 판매', noOffers: '아직 판매 목록이 없습니다. 이 발매작을 처음 등록해 보세요.', noReleases: '발매작을 찾지 못했습니다', emptyHint: '연도 범위를 넓히거나 필터를 지워 보세요.', seeCatalogue: '곡 카탈로그 보기', footerTagline: '곡을 찾고 발매작을 둘러보세요.', buyerName: '이름', request: '요청', preparing: '음원을 준비하는 중…',
      trackFound: '곡을 찾고 카탈로그에 저장했습니다.', noMatch: '아직 일치하는 곡이 없습니다.', audioError: '음원을 처리할 수 없습니다. 다른 파일이나 더 짧은 음원을 사용해 보세요.', recordingError: '이 브라우저에서는 녹음할 수 없습니다. 음원 파일을 선택하세요.', allowMicrophone: '녹음을 허용하거나 음원 파일을 선택하세요.', recording: '녹음 중… 눌러서 중지', recordAgain: '8초 녹음',
      backCatalogue: '← 카탈로그로', addShelf: '선반에 추가', listRelease: '발매작 등록', sellIntro: '발매작을 선택하고 데모 판매 목록을 추가하세요. 결제나 배송은 진행되지 않습니다.', release: '발매작', chooseRelease: '발매작 선택', sellerName: '판매자 이름', sellerPlaceholder: '예: Lantern Records', condition: '상태', priceVnd: '가격 (VND)',
      priceEntryNote: '가격은 VND로 입력합니다. 표시 가격은 참고용으로 환산됩니다.', pricePlaceholder: '예: 250000', addDemoListing: '데모 목록 추가', formatVinyl: '바이닐', formatCd: 'CD', formatCassette: '카세트', formatDigital: '디지털', conditionNew: '새 상품', conditionLikeNew: '거의 새 상품', conditionGood: '양호', conditionFair: '보통', conditionIgnored: '상태 (디지털 제외)',
      referenceDate: '참고 환율: {date}'
    },
    'zh-CN': {
      discover: '浏览', identify: '识别歌曲', sellRecord: '发布唱片', darkMode: '深色模式', lightMode: '浅色模式',
      heroEyebrow: '聆听。发现。珍藏。', heroLine1: '音乐总会', heroLine2: '再次回到身边。', heroIntro: '通过一段短音频识别歌曲，并在同一处浏览发行版本和商品。', identifySong: '识别歌曲', heroFoot: '发现熟悉的旋律',
      recognitionEyebrow: '几秒钟就够了', recognitionTitle: '这是什么歌？', recognitionIntro: '上传一段短音频，或在浏览器中录音来查找歌曲。', startSample: '从音频开始', sampleHint: '请使用清晰的 5–8 秒片段。录音不会保存，识别到的歌曲信息会加入目录。',
      chooseAudio: '选择音频', changeAudio: '更换音频', recordAudio: '录制 8 秒', findTrack: '查找歌曲', remove: '移除', readyToIdentify: '可以开始识别', catalogueEyebrow: '音乐目录', catalogueTitle: '跟随声音。',
      searchLabel: '按标题或艺人搜索', searchPlaceholder: '输入标题或艺人', artistLabel: '艺人', artistPlaceholder: '所有艺人', fromYear: '起始年份', toYear: '结束年份', any: '不限', format: '格式', allFormats: '所有格式', filter: '筛选', clear: '清除',
      unknownYear: '年份未知', oneOffer: '个商品', manyOffers: '个商品', noOffers: '暂时没有商品。你可以先发布这个版本。', noReleases: '未找到发行版本', emptyHint: '请扩大年份范围或清除筛选条件。', seeCatalogue: '查看歌曲目录', footerTagline: '找到歌曲，探索发行版本。', buyerName: '您的姓名', request: '提交请求', preparing: '正在准备音频…',
      trackFound: '歌曲已识别并保存到目录。', noMatch: '暂未找到匹配项。', audioError: '无法处理音频。请尝试其他文件或更短的片段。', recordingError: '此浏览器无法录音，请选择音频文件。', allowMicrophone: '请允许使用麦克风，或选择音频文件。', recording: '正在录音…点击停止', recordAgain: '录制 8 秒',
      backCatalogue: '← 返回目录', addShelf: '加入唱片架', listRelease: '发布发行版本', sellIntro: '选择一个发行版本并添加演示商品。本演示不处理付款或配送。', release: '发行版本', chooseRelease: '选择发行版本', sellerName: '卖家名称', sellerPlaceholder: '例如：Lantern Records',
      condition: '品相', priceVnd: '价格（VND）', priceEntryNote: '请以 VND 输入价格，浏览时会显示换算值。', pricePlaceholder: '例如：250000', addDemoListing: '添加演示商品', formatVinyl: '黑胶', formatCd: 'CD', formatCassette: '磁带', formatDigital: '数字版', conditionNew: '全新', conditionLikeNew: '近全新', conditionGood: '良好', conditionFair: '一般', conditionIgnored: '品相（数字版不适用）',
      referenceDate: '参考汇率：{date}'
    }
  };
  const marketplaceTranslations = {
    'vi-VN': {
      trackCatalogueNav: 'Danh mục bài hát', shopRecords: 'Mua đĩa', heroAnnotation: 'ÂM NHẠC LÊN KỆ', heroChapter: '01 / LẮNG NGHE', shopAvailable: 'Xem sản phẩm đang bán', shopAvailableHint: 'Chỉ gồm sản phẩm có người bán', recordingsToSearch: 'bản ghi để tìm kiếm',
      marketEyebrow: 'CHỢ MELODEX', marketTitle: 'Tìm đĩa nhạc tiếp theo.', marketIntro: 'Khám phá các bài hát Melodex đã biết hoặc xem đĩa đang được bán.', catalogueTab: 'Danh mục', availableOffers: 'Sản phẩm đang bán', itemsIWant: 'Danh sách mong muốn', savedSearches: 'Tìm kiếm đã lưu', myCollection: 'Bộ sưu tập', purchases: 'Đơn mua', cart: 'Giỏ hàng', buyerSettings: 'Cài đặt người mua',
      trackCatalogueHeading: 'Danh mục bài hát', catalogueCountSuffix: 'known tracks in the Melodex catalogue. Seller offers are shown separately.', browseCurrentOffers: 'Xem sản phẩm đang bán', trackTitle: 'Tên bài hát', searchSong: 'Tìm bài hát', searchArtist: 'Tìm nghệ sĩ', searchCatalogue: 'Tìm trong danh mục',
      allRecordings: 'Tất cả bản ghi', searchResultsPage: 'Kết quả tìm kiếm · trang', listView: 'Danh sách', gridView: 'Lưới', activeOffer: 'tin đang bán', activeOffers: 'tin đang bán', fromPrice: 'từ', noActiveOffer: 'Chưa có tin bán', wantlist: 'Muốn mua', collection: 'Bộ sưu tập', checkListings: 'Xem tin bán', noCatalogueMatches: 'Không tìm thấy kết quả', tryDifferentSearch: 'Hãy thử tìm kiếm khác.', browseCatalogue: 'Duyệt danh mục', previous: 'Trước', next: 'Tiếp', page: 'Trang', entriesShown: 'bản ghi hiển thị',
      availableListings: 'Sản phẩm đang bán', itemsMatchFilters: 'sản phẩm phù hợp bộ lọc', clearFilters: 'Xóa bộ lọc', search: 'Tìm kiếm', titleArtistOrSeller: 'Tên bài, nghệ sĩ hoặc người bán', searchListings: 'Tìm tin đăng', anyArtist: 'Mọi nghệ sĩ', condition: 'Tình trạng', anyCondition: 'Mọi tình trạng', priceRange: 'Khoảng giá', min: 'Thấp nhất', max: 'Cao nhất', noLimit: 'Không giới hạn', releaseYear: 'Năm phát hành', from: 'Từ', to: 'Đến', seller: 'Người bán', sellerNameLabel: 'Tên người bán', anySeller: 'Mọi người bán', applyFilters: 'Áp dụng bộ lọc', saveThisSearch: 'Lưu tìm kiếm này', sortBy: 'Sắp xếp theo', sortListings: 'Sắp xếp tin đăng', recentlyListed: 'Mới đăng gần đây', priceLowToHigh: 'Giá: thấp đến cao', priceHighToLow: 'Giá: cao đến thấp', title: 'Tên bài', yearNewest: 'Năm: mới nhất', sort: 'Sắp xếp', addToCart: 'Thêm vào giỏ', noListingsMatch: 'Không có sản phẩm phù hợp bộ lọc', widenOfferFilters: 'Hãy mở rộng khoảng giá hoặc chọn định dạng khác.', showAvailableOffers: 'Hiện mọi sản phẩm đang bán', of: 'trên',
      wantlistDescription: 'Được lưu trong trình duyệt này. Tin bán sẽ hiện khi có.', savedSearchesDescription: 'Lưu bộ lọc trong trình duyệt và mở lại sau.', collectionDescription: 'Lưu các bản ghi yêu thích vào kệ cá nhân trong trình duyệt.', yourCart: 'Giỏ hàng', cartDescription: 'Đây chỉ là yêu cầu mẫu, không thanh toán hay giao hàng.', subtotal: 'Tạm tính', submitOrderRequest: 'Gửi yêu cầu mẫu', cartSubmitNote: 'Gửi yêu cầu sẽ tạo đơn mẫu và đánh dấu tin đăng đã được yêu cầu.', purchaseRequests: 'Yêu cầu mua', purchaseRequestsDescription: 'Các yêu cầu mẫu theo tên người mua của bạn.', buyerSettingsDescription: 'Tên này liên kết trình duyệt với lịch sử yêu cầu mẫu.', buyerNameLabel: 'Tên người mua', buyerNamePlaceholder: 'Nhập tên dùng cho yêu cầu mẫu', saveSettings: 'Lưu cài đặt', buyerPrivacyNote: 'Melodex không tạo tài khoản người mua hay lưu địa chỉ. Thanh toán và giao hàng không thuộc bản demo này.', buyerTools: 'CÔNG CỤ NGƯỜI MUA', admin: 'Quản trị',
      alreadyInCart: 'Sản phẩm này đã có trong giỏ.', addedToCart: 'Đã thêm vào giỏ.', alreadySaved: 'Tìm kiếm này đã được lưu.', savedSearchFeedback: 'Đã lưu tìm kiếm trong trình duyệt.', addToCartAction: 'Thêm vào giỏ', emptyWantlist: 'Danh sách mong muốn đang trống.', findRecordingToSave: 'Tìm bản ghi để lưu', noAvailableListingsYet: 'Chưa có tin bán', searchListingsAction: 'Tìm tin bán', noSavedSearches: 'Chưa lưu tìm kiếm nào.', filterAvailableOffers: 'Lọc sản phẩm đang bán', openSearch: 'Mở tìm kiếm', emptyCollection: 'Bộ sưu tập đang trống.', browseCatalogueAction: 'Duyệt danh mục', checkOffers: 'Xem sản phẩm', emptyCart: 'Giỏ hàng đang trống.', browseAvailableListings: 'Duyệt sản phẩm đang bán', listingUnavailable: 'Tin đăng này không còn khả dụng. Hãy xóa khỏi giỏ để tiếp tục.', buyerNameNeeded: 'Thêm tên người mua trong cài đặt để xem yêu cầu mẫu.', openBuyerSettings: 'Mở cài đặt người mua', noPurchaseRequests: 'Chưa có yêu cầu mua theo tên này.', buyerSettingsSaved: 'Đã lưu cài đặt. Yêu cầu mua sẽ dùng tên này.', setBuyerNameFirst: 'Hãy đặt tên người mua trước khi gửi yêu cầu mẫu.'
    },
    'es-ES': {
      trackCatalogueNav: 'Catálogo de canciones', shopRecords: 'Comprar discos', heroAnnotation: 'MÚSICA A TU ESTANTERÍA', heroChapter: '01 / ESCUCHAR', shopAvailable: 'Ver discos disponibles', shopAvailableHint: 'Solo artículos con vendedor', recordingsToSearch: 'grabaciones para buscar',
      marketEyebrow: 'MERCADO MELODEX', marketTitle: 'Encuentra tu próximo disco.', marketIntro: 'Explora las canciones que Melodex conoce o compra discos con una oferta activa.', catalogueTab: 'Catálogo', availableOffers: 'Ofertas disponibles', itemsIWant: 'Mi lista de deseos', savedSearches: 'Búsquedas guardadas', myCollection: 'Mi colección', purchases: 'Compras', cart: 'Carrito', buyerSettings: 'Preferencias de compra',
      trackCatalogueHeading: 'Catálogo de canciones', catalogueCountSuffix: 'known tracks in the Melodex catalogue. Seller offers are shown separately.', browseCurrentOffers: 'Ver ofertas actuales', trackTitle: 'Título de la canción', searchSong: 'Buscar canción', searchArtist: 'Buscar artista', searchCatalogue: 'Buscar en el catálogo',
      allRecordings: 'Todas las grabaciones', searchResultsPage: 'Resultados · página', listView: 'Lista', gridView: 'Cuadrícula', activeOffer: 'oferta activa', activeOffers: 'ofertas activas', fromPrice: 'desde', noActiveOffer: 'Sin ofertas activas', wantlist: 'Lista de deseos', collection: 'Colección', checkListings: 'Ver anuncios', noCatalogueMatches: 'No hay coincidencias', tryDifferentSearch: 'Prueba otra búsqueda.', browseCatalogue: 'Explorar el catálogo', previous: 'Anterior', next: 'Siguiente', page: 'Página', entriesShown: 'grabaciones mostradas',
      availableListings: 'Anuncios disponibles', itemsMatchFilters: 'artículos coinciden con los filtros', clearFilters: 'Borrar filtros', search: 'Buscar', titleArtistOrSeller: 'Título, artista o vendedor', searchListings: 'Buscar anuncios', anyArtist: 'Cualquier artista', condition: 'Estado', anyCondition: 'Cualquier estado', priceRange: 'Intervalo de precios', min: 'Mín.', max: 'Máx.', noLimit: 'Sin límite', releaseYear: 'Año de publicación', from: 'Desde', to: 'Hasta', seller: 'Vendedor', sellerNameLabel: 'Nombre del vendedor', anySeller: 'Cualquier vendedor', applyFilters: 'Aplicar filtros', saveThisSearch: 'Guardar búsqueda', sortBy: 'Ordenar por', sortListings: 'Ordenar anuncios', recentlyListed: 'Añadidos recientemente', priceLowToHigh: 'Precio: menor a mayor', priceHighToLow: 'Precio: mayor a menor', title: 'Título', yearNewest: 'Año: más reciente', sort: 'Ordenar', addToCart: 'Añadir al carrito', noListingsMatch: 'Ningún anuncio coincide con estos filtros', widenOfferFilters: 'Amplía el intervalo de precio o elige otro formato.', showAvailableOffers: 'Mostrar todas las ofertas', of: 'de',
      wantlistDescription: 'Se guarda en este navegador. Las ofertas aparecen cuando existen.', savedSearchesDescription: 'Guarda combinaciones de filtros y vuelve a abrirlas aquí.', collectionDescription: 'Guarda ediciones en tu estantería personal de este navegador.', yourCart: 'Tu carrito', cartDescription: 'Las solicitudes son solo de demostración. No se cobra ni se organiza el envío.', subtotal: 'Subtotal', submitOrderRequest: 'Enviar solicitud de muestra', cartSubmitNote: 'Al enviar, se crea una solicitud de compra de muestra y se marcan los anuncios como solicitados.', purchaseRequests: 'Solicitudes de compra', purchaseRequestsDescription: 'Solicitudes de muestra guardadas con tu nombre.', buyerSettingsDescription: 'Tu nombre vincula este navegador con el historial de solicitudes de muestra.', buyerNameLabel: 'Nombre del comprador', buyerNamePlaceholder: 'Escribe el nombre para tus solicitudes', saveSettings: 'Guardar preferencias', buyerPrivacyNote: 'Melodex no crea cuentas ni guarda direcciones. El pago y el envío no forman parte de esta demo.', buyerTools: 'HERRAMIENTAS DE COMPRA', admin: 'Administración',
      alreadyInCart: 'Ese artículo ya está en el carrito.', addedToCart: 'Artículo añadido al carrito.', alreadySaved: 'Esa búsqueda ya está guardada.', savedSearchFeedback: 'Búsqueda guardada en este navegador.', addToCartAction: 'Añadir al carrito', emptyWantlist: 'Tu lista de deseos está vacía.', findRecordingToSave: 'Busca una grabación para guardar', noAvailableListingsYet: 'Aún no hay ofertas disponibles', searchListingsAction: 'Buscar anuncios', noSavedSearches: 'No hay búsquedas guardadas.', filterAvailableOffers: 'Filtrar ofertas disponibles', openSearch: 'Abrir búsqueda', emptyCollection: 'Tu colección está vacía.', browseCatalogueAction: 'Explorar el catálogo', checkOffers: 'Ver ofertas', emptyCart: 'Tu carrito está vacío.', browseAvailableListings: 'Ver anuncios disponibles', listingUnavailable: 'Este anuncio ya no está disponible. Quítalo del carrito para continuar.', buyerNameNeeded: 'Añade un nombre en preferencias para ver las solicitudes de muestra.', openBuyerSettings: 'Abrir preferencias de compra', noPurchaseRequests: 'No hay solicitudes con este nombre.', buyerSettingsSaved: 'Preferencias guardadas. Las solicitudes usarán este nombre.', setBuyerNameFirst: 'Indica el nombre del comprador antes de enviar la solicitud.'
    },
    'fr-FR': {
      trackCatalogueNav: 'Catalogue des titres', shopRecords: 'Acheter des disques', heroAnnotation: 'DE LA MUSIQUE À L’ÉTAGÈRE', heroChapter: '01 / ÉCOUTER', shopAvailable: 'Voir les annonces disponibles', shopAvailableHint: 'Uniquement les articles proposés', recordingsToSearch: 'enregistrements à rechercher',
      marketEyebrow: 'MARCHÉ MELODEX', marketTitle: 'Trouvez votre prochain disque.', marketIntro: 'Explorez les titres connus de Melodex ou consultez les disques proposés à la vente.', catalogueTab: 'Catalogue', availableOffers: 'Offres disponibles', itemsIWant: 'Ma liste d’envies', savedSearches: 'Recherches enregistrées', myCollection: 'Ma collection', purchases: 'Achats', cart: 'Panier', buyerSettings: 'Préférences acheteur',
      trackCatalogueHeading: 'Catalogue des titres', catalogueCountSuffix: 'known tracks in the Melodex catalogue. Seller offers are shown separately.', browseCurrentOffers: 'Voir les offres actuelles', trackTitle: 'Titre du morceau', searchSong: 'Rechercher un morceau', searchArtist: 'Rechercher un artiste', searchCatalogue: 'Rechercher dans le catalogue',
      allRecordings: 'Tous les enregistrements', searchResultsPage: 'Résultats · page', listView: 'Liste', gridView: 'Grille', activeOffer: 'offre active', activeOffers: 'offres actives', fromPrice: 'à partir de', noActiveOffer: 'Aucune offre active', wantlist: 'Liste d’envies', collection: 'Collection', checkListings: 'Voir les annonces', noCatalogueMatches: 'Aucun résultat', tryDifferentSearch: 'Essayez une autre recherche.', browseCatalogue: 'Parcourir le catalogue', previous: 'Précédent', next: 'Suivant', page: 'Page', entriesShown: 'enregistrements affichés',
      availableListings: 'Annonces disponibles', itemsMatchFilters: 'articles correspondent aux filtres', clearFilters: 'Effacer les filtres', search: 'Rechercher', titleArtistOrSeller: 'Titre, artiste ou vendeur', searchListings: 'Rechercher des annonces', anyArtist: 'Tous les artistes', condition: 'État', anyCondition: 'Tous les états', priceRange: 'Fourchette de prix', min: 'Min.', max: 'Max.', noLimit: 'Sans limite', releaseYear: 'Année de sortie', from: 'De', to: 'À', seller: 'Vendeur', sellerNameLabel: 'Nom du vendeur', anySeller: 'Tous les vendeurs', applyFilters: 'Appliquer les filtres', saveThisSearch: 'Enregistrer cette recherche', sortBy: 'Trier par', sortListings: 'Trier les annonces', recentlyListed: 'Récemment ajoutés', priceLowToHigh: 'Prix : croissant', priceHighToLow: 'Prix : décroissant', title: 'Titre', yearNewest: 'Année : récente', sort: 'Trier', addToCart: 'Ajouter au panier', noListingsMatch: 'Aucune annonce ne correspond à ces filtres', widenOfferFilters: 'Élargissez la fourchette de prix ou choisissez un autre format.', showAvailableOffers: 'Afficher toutes les offres', of: 'sur',
      wantlistDescription: 'Enregistrée dans ce navigateur. Les offres apparaissent lorsqu’elles existent.', savedSearchesDescription: 'Enregistrez vos filtres ici et rouvrez-les plus tard.', collectionDescription: 'Gardez une étagère personnelle d’éditions dans ce navigateur.', yourCart: 'Votre panier', cartDescription: 'Les demandes sont des démonstrations. Aucun paiement ni envoi n’est effectué.', subtotal: 'Sous-total', submitOrderRequest: 'Envoyer une demande de démo', cartSubmitNote: 'La demande crée un achat de démonstration et marque les annonces comme demandées.', purchaseRequests: 'Demandes d’achat', purchaseRequestsDescription: 'Demandes de démonstration enregistrées sous votre nom.', buyerSettingsDescription: 'Votre nom relie ce navigateur à son historique de demandes.', buyerNameLabel: 'Nom de l’acheteur', buyerNamePlaceholder: 'Saisissez le nom à associer aux demandes', saveSettings: 'Enregistrer les préférences', buyerPrivacyNote: 'Melodex ne crée pas de compte acheteur ni ne conserve d’adresse. Paiement et livraison sont hors démonstration.', buyerTools: 'OUTILS ACHETEUR', admin: 'Administration',
      alreadyInCart: 'Cet article est déjà dans le panier.', addedToCart: 'Article ajouté au panier.', alreadySaved: 'Cette recherche est déjà enregistrée.', savedSearchFeedback: 'Recherche enregistrée dans ce navigateur.', addToCartAction: 'Ajouter au panier', emptyWantlist: 'Votre liste d’envies est vide.', findRecordingToSave: 'Rechercher un enregistrement à enregistrer', noAvailableListingsYet: 'Aucune offre disponible pour le moment', searchListingsAction: 'Rechercher des annonces', noSavedSearches: 'Aucune recherche enregistrée.', filterAvailableOffers: 'Filtrer les offres disponibles', openSearch: 'Ouvrir la recherche', emptyCollection: 'Votre collection est vide.', browseCatalogueAction: 'Parcourir le catalogue', checkOffers: 'Voir les offres', emptyCart: 'Votre panier est vide.', browseAvailableListings: 'Voir les annonces disponibles', listingUnavailable: 'Cette annonce n’est plus disponible. Retirez-la du panier pour continuer.', buyerNameNeeded: 'Ajoutez un nom dans les préférences pour consulter les demandes de démonstration.', openBuyerSettings: 'Ouvrir les préférences acheteur', noPurchaseRequests: 'Aucune demande d’achat n’a été faite sous ce nom.', buyerSettingsSaved: 'Préférences enregistrées. Les demandes utiliseront ce nom.', setBuyerNameFirst: 'Saisissez votre nom avant d’envoyer une demande de démonstration.'
    },
    'ja-JP': {
      trackCatalogueNav: '曲カタログ', shopRecords: 'レコードを購入', heroAnnotation: '音楽を棚へ', heroChapter: '01 / 聴く', shopAvailable: '販売中の商品を見る', shopAvailableHint: '出品者がいる商品だけ', recordingsToSearch: '件を検索できます',
      marketEyebrow: 'MELODEX マーケット', marketTitle: '次のお気に入りを見つけよう。', marketIntro: 'Melodexに登録された曲を検索するか、出品中のレコードを購入できます。', catalogueTab: 'カタログ', availableOffers: '販売中', itemsIWant: 'ほしい物', savedSearches: '保存した検索', myCollection: 'コレクション', purchases: '購入履歴', cart: 'カート', buyerSettings: '購入者設定',
      trackCatalogueHeading: '曲カタログ', catalogueCountSuffix: 'known tracks in the Melodex catalogue. Seller offers are shown separately.', browseCurrentOffers: '販売中の商品を見る', trackTitle: '曲名', searchSong: '曲を検索', searchArtist: 'アーティストを検索', searchCatalogue: 'カタログを検索',
      allRecordings: 'すべての録音', searchResultsPage: '検索結果 · ページ', listView: 'リスト', gridView: 'グリッド', activeOffer: '件の出品', activeOffers: '件の出品', fromPrice: '価格', noActiveOffer: '販売中の商品はありません', wantlist: 'ほしい物', collection: 'コレクション', checkListings: '出品を見る', noCatalogueMatches: '一致する項目がありません', tryDifferentSearch: '別の条件で検索してください。', browseCatalogue: 'カタログを見る', previous: '前へ', next: '次へ', page: 'ページ', entriesShown: '件を表示',
      availableListings: '販売中の商品', itemsMatchFilters: '件が条件に一致', clearFilters: '条件をクリア', search: '検索', titleArtistOrSeller: '曲名、アーティスト、出品者', searchListings: '出品を検索', anyArtist: 'すべてのアーティスト', condition: '状態', anyCondition: 'すべての状態', priceRange: '価格帯', min: '下限', max: '上限', noLimit: '指定なし', releaseYear: '発売年', from: '開始', to: '終了', seller: '出品者', sellerNameLabel: '出品者名', anySeller: 'すべての出品者', applyFilters: '条件を適用', saveThisSearch: '検索条件を保存', sortBy: '並べ替え', sortListings: '出品を並べ替え', recentlyListed: '新着順', priceLowToHigh: '価格の安い順', priceHighToLow: '価格の高い順', title: 'タイトル', yearNewest: '発売年の新しい順', sort: '並べ替え', addToCart: 'カートに追加', noListingsMatch: '条件に合う商品がありません', widenOfferFilters: '価格帯を広げるか、別の形式を選んでください。', showAvailableOffers: 'すべての販売商品を見る', of: '/',
      wantlistDescription: 'このブラウザーに保存されます。出品がある場合はここに表示されます。', savedSearchesDescription: '検索条件を保存して、後から開けます。', collectionDescription: 'カタログの作品をこのブラウザーのコレクションに保存します。', yourCart: 'カート', cartDescription: 'デモ用の購入リクエストです。決済や配送は行いません。', subtotal: '小計', submitOrderRequest: 'デモリクエストを送信', cartSubmitNote: '送信するとデモ注文を記録し、商品をリクエスト済みにします。', purchaseRequests: '購入リクエスト', purchaseRequestsDescription: 'お客様の名前で保存されたデモリクエストです。', buyerSettingsDescription: 'この名前でブラウザーのデモ購入履歴を確認できます。', buyerNameLabel: '購入者名', buyerNamePlaceholder: 'リクエストに使用する名前を入力', saveSettings: '設定を保存', buyerPrivacyNote: 'Melodex は購入アカウントや住所を保存しません。決済と配送はデモの対象外です。', buyerTools: '購入者ツール', admin: '管理',
      alreadyInCart: 'この商品はすでにカートにあります。', addedToCart: 'カートに追加しました。', alreadySaved: 'この検索条件はすでに保存されています。', savedSearchFeedback: '検索条件をこのブラウザーに保存しました。', addToCartAction: 'カートに追加', emptyWantlist: 'ほしい物リストは空です。', findRecordingToSave: '保存する曲を検索', noAvailableListingsYet: '販売中の商品はありません', searchListingsAction: '出品を検索', noSavedSearches: '保存した検索はありません。', filterAvailableOffers: '販売中の商品を絞り込む', openSearch: '検索を開く', emptyCollection: 'コレクションは空です。', browseCatalogueAction: 'カタログを見る', checkOffers: '出品を見る', emptyCart: 'カートは空です。', browseAvailableListings: '販売中の商品を見る', listingUnavailable: 'この商品は販売終了です。続けるにはカートから削除してください。', buyerNameNeeded: '設定に購入者名を追加するとデモリクエストを確認できます。', openBuyerSettings: '購入者設定を開く', noPurchaseRequests: 'この名前での購入リクエストはありません。', buyerSettingsSaved: '設定を保存しました。リクエストにはこの名前を使用します。', setBuyerNameFirst: 'デモリクエストを送る前に購入者名を設定してください。'
    },
    'ko-KR': {
      trackCatalogueNav: '곡 카탈로그', shopRecords: '음반 구매', heroAnnotation: '음악을 선반으로', heroChapter: '01 / 듣기', shopAvailable: '판매 중인 상품 보기', shopAvailableHint: '판매자가 등록한 상품만 표시', recordingsToSearch: '개 녹음 검색 가능',
      marketEyebrow: 'MELODEX 마켓', marketTitle: '다음 음반을 찾아보세요.', marketIntro: 'Melodex에 등록된 곡을 검색하거나 판매 중인 음반을 둘러보세요.', catalogueTab: '카탈로그', availableOffers: '판매 중', itemsIWant: '위시리스트', savedSearches: '저장한 검색', myCollection: '내 컬렉션', purchases: '구매 내역', cart: '장바구니', buyerSettings: '구매자 설정',
      trackCatalogueHeading: '곡 카탈로그', catalogueCountSuffix: 'known tracks in the Melodex catalogue. Seller offers are shown separately.', browseCurrentOffers: '판매 상품 보기', trackTitle: '곡 제목', searchSong: '곡 검색', searchArtist: '아티스트 검색', searchCatalogue: '카탈로그 검색',
      allRecordings: '전체 녹음', searchResultsPage: '검색 결과 · 페이지', listView: '목록', gridView: '그리드', activeOffer: '개 판매 중', activeOffers: '개 판매 중', fromPrice: '최저가', noActiveOffer: '판매 중인 상품 없음', wantlist: '위시리스트', collection: '컬렉션', checkListings: '판매 목록 보기', noCatalogueMatches: '검색 결과가 없습니다', tryDifferentSearch: '다른 검색어를 입력해 보세요.', browseCatalogue: '카탈로그 둘러보기', previous: '이전', next: '다음', page: '페이지', entriesShown: '개 표시',
      availableListings: '판매 중인 상품', itemsMatchFilters: '개 상품이 조건과 일치합니다', clearFilters: '필터 초기화', search: '검색', titleArtistOrSeller: '제목, 아티스트 또는 판매자', searchListings: '판매 목록 검색', anyArtist: '전체 아티스트', condition: '상태', anyCondition: '모든 상태', priceRange: '가격 범위', min: '최소', max: '최대', noLimit: '제한 없음', releaseYear: '발매 연도', from: '시작', to: '끝', seller: '판매자', sellerNameLabel: '판매자 이름', anySeller: '전체 판매자', applyFilters: '필터 적용', saveThisSearch: '검색 저장', sortBy: '정렬 기준', sortListings: '판매 목록 정렬', recentlyListed: '최신 등록순', priceLowToHigh: '가격 낮은 순', priceHighToLow: '가격 높은 순', title: '제목', yearNewest: '최신 연도순', sort: '정렬', addToCart: '장바구니 담기', noListingsMatch: '조건에 맞는 판매 상품이 없습니다', widenOfferFilters: '가격 범위를 넓히거나 다른 형식을 선택해 보세요.', showAvailableOffers: '전체 판매 상품 보기', of: '/',
      wantlistDescription: '이 브라우저에 저장됩니다. 판매 상품이 있으면 여기에 표시됩니다.', savedSearchesDescription: '필터를 저장하고 나중에 다시 열 수 있습니다.', collectionDescription: '이 브라우저에 카탈로그 항목을 개인 컬렉션으로 저장합니다.', yourCart: '장바구니', cartDescription: '데모 요청이며 결제나 배송은 진행되지 않습니다.', subtotal: '소계', submitOrderRequest: '데모 요청 보내기', cartSubmitNote: '전송하면 데모 구매 기록이 생성되고 판매 목록이 요청 상태로 표시됩니다.', purchaseRequests: '구매 요청', purchaseRequestsDescription: '구매자 이름으로 저장된 데모 요청입니다.', buyerSettingsDescription: '이 이름으로 브라우저의 데모 요청 내역을 확인합니다.', buyerNameLabel: '구매자 이름', buyerNamePlaceholder: '데모 요청에 사용할 이름 입력', saveSettings: '설정 저장', buyerPrivacyNote: 'Melodex는 구매 계정이나 주소를 저장하지 않습니다. 결제와 배송은 데모 범위에 포함되지 않습니다.', buyerTools: '구매 도구', admin: '관리자',
      alreadyInCart: '이미 장바구니에 담긴 상품입니다.', addedToCart: '장바구니에 추가했습니다.', alreadySaved: '이미 저장된 검색입니다.', savedSearchFeedback: '검색을 이 브라우저에 저장했습니다.', addToCartAction: '장바구니 담기', emptyWantlist: '위시리스트가 비어 있습니다.', findRecordingToSave: '저장할 녹음 검색', noAvailableListingsYet: '아직 판매 상품이 없습니다', searchListingsAction: '판매 목록 검색', noSavedSearches: '저장한 검색이 없습니다.', filterAvailableOffers: '판매 상품 필터링', openSearch: '검색 열기', emptyCollection: '컬렉션이 비어 있습니다.', browseCatalogueAction: '카탈로그 둘러보기', checkOffers: '판매 상품 보기', emptyCart: '장바구니가 비어 있습니다.', browseAvailableListings: '판매 상품 둘러보기', listingUnavailable: '이 상품은 더 이상 판매되지 않습니다. 계속하려면 장바구니에서 삭제하세요.', buyerNameNeeded: '데모 요청을 보려면 설정에 구매자 이름을 추가하세요.', openBuyerSettings: '구매자 설정 열기', noPurchaseRequests: '이 이름으로 저장된 구매 요청이 없습니다.', buyerSettingsSaved: '설정을 저장했습니다. 요청에 이 이름을 사용합니다.', setBuyerNameFirst: '데모 요청 전에 구매자 이름을 설정하세요.'
    },
    'zh-CN': {
      trackCatalogueNav: '歌曲目录', shopRecords: '购买唱片', heroAnnotation: '把音乐带回唱片架', heroChapter: '01 / 聆听', shopAvailable: '查看在售唱片', shopAvailableHint: '仅显示卖家已发布的商品', recordingsToSearch: '首录音可供搜索',
      marketEyebrow: 'MELODEX 市场', marketTitle: '寻找下一张唱片。', marketIntro: '浏览 Melodex 已收录的歌曲，或查看卖家当前在售的唱片。', catalogueTab: '曲库', availableOffers: '在售商品', itemsIWant: '心愿单', savedSearches: '已保存的搜索', myCollection: '我的收藏', purchases: '购买记录', cart: '购物车', buyerSettings: '买家设置',
      trackCatalogueHeading: '歌曲目录', catalogueCountSuffix: 'known tracks in the Melodex catalogue. Seller offers are shown separately.', browseCurrentOffers: '查看当前在售商品', trackTitle: '歌曲标题', searchSong: '搜索歌曲', searchArtist: '搜索艺人', searchCatalogue: '搜索曲库',
      allRecordings: '全部录音', searchResultsPage: '搜索结果 · 第', listView: '列表', gridView: '网格', activeOffer: '个在售商品', activeOffers: '个在售商品', fromPrice: '起价', noActiveOffer: '暂无在售商品', wantlist: '心愿单', collection: '收藏', checkListings: '查看商品', noCatalogueMatches: '没有匹配结果', tryDifferentSearch: '请尝试其他搜索条件。', browseCatalogue: '浏览曲库', previous: '上一页', next: '下一页', page: '第', entriesShown: '条结果',
      availableListings: '在售商品', itemsMatchFilters: '件商品符合筛选条件', clearFilters: '清除筛选', search: '搜索', titleArtistOrSeller: '标题、艺人或卖家', searchListings: '搜索商品', anyArtist: '所有艺人', condition: '品相', anyCondition: '不限品相', priceRange: '价格范围', min: '最低', max: '最高', noLimit: '不限', releaseYear: '发行年份', from: '从', to: '至', seller: '卖家', sellerNameLabel: '卖家名称', anySeller: '所有卖家', applyFilters: '应用筛选', saveThisSearch: '保存此搜索', sortBy: '排序方式', sortListings: '商品排序', recentlyListed: '最新发布', priceLowToHigh: '价格从低到高', priceHighToLow: '价格从高到低', title: '标题', yearNewest: '发行年份：最新', sort: '排序', addToCart: '加入购物车', noListingsMatch: '没有商品符合这些条件', widenOfferFilters: '请扩大价格范围或选择其他格式。', showAvailableOffers: '显示全部在售商品', of: '/',
      wantlistDescription: '保存在此浏览器中。有在售商品时会显示在这里。', savedSearchesDescription: '保存筛选组合，之后可以重新打开。', collectionDescription: '在此浏览器中保存个人曲库收藏。', yourCart: '购物车', cartDescription: '此处仅提交演示请求，不会付款或安排配送。', subtotal: '小计', submitOrderRequest: '提交演示请求', cartSubmitNote: '提交后会创建演示购买记录，并将商品标记为已请求。', purchaseRequests: '购买请求', purchaseRequestsDescription: '以您的买家名称保存的演示请求。', buyerSettingsDescription: '使用此名称查看浏览器中的演示请求记录。', buyerNameLabel: '买家名称', buyerNamePlaceholder: '输入演示请求使用的名称', saveSettings: '保存设置', buyerPrivacyNote: 'Melodex 不创建买家账户，也不保存地址。付款和配送不属于此演示范围。', buyerTools: '买家工具', admin: '管理',
      alreadyInCart: '该商品已在购物车中。', addedToCart: '已加入购物车。', alreadySaved: '该搜索已保存。', savedSearchFeedback: '已将搜索保存在此浏览器中。', addToCartAction: '加入购物车', emptyWantlist: '心愿单为空。', findRecordingToSave: '搜索要收藏的录音', noAvailableListingsYet: '暂无在售商品', searchListingsAction: '搜索商品', noSavedSearches: '尚未保存搜索。', filterAvailableOffers: '筛选在售商品', openSearch: '打开搜索', emptyCollection: '收藏为空。', browseCatalogueAction: '浏览曲库', checkOffers: '查看商品', emptyCart: '购物车为空。', browseAvailableListings: '浏览在售商品', listingUnavailable: '该商品已不可购买。请从购物车中移除后继续。', buyerNameNeeded: '请在设置中填写买家名称以查看演示请求。', openBuyerSettings: '打开买家设置', noPurchaseRequests: '该名称下暂无购买请求。', buyerSettingsSaved: '设置已保存。请求将使用此名称。', setBuyerNameFirst: '请先设置买家名称，再提交演示请求。'
    }
  };
  // English uses the base copy, but still needs a destination for later translation merges.
  translations['en-US'] = translations['en-US'] || {};
  translations['en-GB'] = translations['en-GB'] || {};
  const interfaceTranslations = {
    'vi-VN': { menu: 'Danh mục', mainNavigation: 'Điều hướng chính', languageCurrency: 'Ngôn ngữ và tiền tệ', catalogueLayout: 'Kiểu hiển thị danh mục', wantMoreRecordings: 'Bạn đang tìm bản ghi chưa có tin bán?', searchTrackCatalogue: 'Tìm toàn bộ danh mục', saved: 'Đã lưu', inCollection: 'Đã có trong bộ sưu tập', removedFromWantlist: 'Đã xóa khỏi danh sách mong muốn.', savedToWantlist: 'Đã lưu vào danh sách mong muốn.', removedFromCollection: 'Đã xóa khỏi bộ sưu tập.', addedToCollection: 'Đã thêm vào bộ sưu tập.', conditionUnknown: 'Chưa rõ tình trạng', orderRequestRecorded: 'Đã ghi nhận yêu cầu mẫu. Không có khoản thanh toán nào được thực hiện. Mã yêu cầu:', requestCouldNotComplete: 'Không thể hoàn tất yêu cầu. Vui lòng thử lại.' },
    'es-ES': { menu: 'Menú', mainNavigation: 'Navegación principal', languageCurrency: 'Idioma y moneda', catalogueLayout: 'Vista del catálogo', wantMoreRecordings: '¿Buscas una grabación que aún no esté a la venta?', searchTrackCatalogue: 'Buscar en el catálogo completo', saved: 'Guardado', inCollection: 'En mi colección', removedFromWantlist: 'Se quitó de tu lista de deseos.', savedToWantlist: 'Se guardó en tu lista de deseos.', removedFromCollection: 'Se quitó de tu colección.', addedToCollection: 'Se añadió a tu colección.', conditionUnknown: 'Estado desconocido', orderRequestRecorded: 'Solicitudes de demostración registradas. No se efectuó ningún pago. Números de solicitud:', requestCouldNotComplete: 'No se pudo completar la solicitud. Inténtalo de nuevo.' },
    'fr-FR': { menu: 'Menu', mainNavigation: 'Navigation principale', languageCurrency: 'Langue et devise', catalogueLayout: 'Affichage du catalogue', wantMoreRecordings: 'Vous cherchez un enregistrement qui n’est pas encore en vente ?', searchTrackCatalogue: 'Rechercher dans le catalogue des titres', saved: 'Enregistré', inCollection: 'Dans ma collection', removedFromWantlist: 'Retiré de votre liste d’envies.', savedToWantlist: 'Ajouté à votre liste d’envies.', removedFromCollection: 'Retiré de votre collection.', addedToCollection: 'Ajouté à votre collection.', conditionUnknown: 'État inconnu', orderRequestRecorded: 'Demandes de démonstration enregistrées. Aucun paiement effectué. Numéros de demande :', requestCouldNotComplete: 'La demande n’a pas abouti. Veuillez réessayer.' },
    'ja-JP': { menu: 'メニュー', mainNavigation: 'メインナビゲーション', languageCurrency: '言語と通貨', catalogueLayout: 'カタログの表示形式', wantMoreRecordings: '販売中ではない曲をお探しですか？', searchTrackCatalogue: '曲のカタログを検索', saved: '保存済み', inCollection: 'コレクションに追加済み', removedFromWantlist: 'ほしい物リストから削除しました。', savedToWantlist: 'ほしい物リストに保存しました。', removedFromCollection: 'コレクションから削除しました。', addedToCollection: 'コレクションに追加しました。', conditionUnknown: '状態不明', orderRequestRecorded: 'デモリクエストを記録しました。決済は行われていません。リクエスト番号：', requestCouldNotComplete: 'リクエストを完了できませんでした。もう一度お試しください。' },
    'ko-KR': { menu: '메뉴', mainNavigation: '주 메뉴', languageCurrency: '언어 및 통화', catalogueLayout: '카탈로그 보기 방식', wantMoreRecordings: '아직 판매 목록이 없는 곡을 찾고 있나요?', searchTrackCatalogue: '곡 카탈로그 검색', saved: '저장됨', inCollection: '컬렉션에 추가됨', removedFromWantlist: '위시리스트에서 삭제했습니다.', savedToWantlist: '위시리스트에 저장했습니다.', removedFromCollection: '컬렉션에서 삭제했습니다.', addedToCollection: '컬렉션에 추가했습니다.', conditionUnknown: '상태 알 수 없음', orderRequestRecorded: '데모 요청을 기록했습니다. 결제는 진행되지 않았습니다. 요청 번호:', requestCouldNotComplete: '요청을 완료하지 못했습니다. 다시 시도하세요.' },
    'zh-CN': { menu: '菜单', mainNavigation: '主导航', languageCurrency: '语言和货币', catalogueLayout: '曲库显示方式', wantMoreRecordings: '没有找到正在出售的这首歌？', searchTrackCatalogue: '搜索歌曲目录', saved: '已保存', inCollection: '已加入收藏', removedFromWantlist: '已从心愿单中移除。', savedToWantlist: '已保存到心愿单。', removedFromCollection: '已从收藏中移除。', addedToCollection: '已加入收藏。', conditionUnknown: '品相未知', orderRequestRecorded: '演示请求已记录，未进行付款。请求编号：', requestCouldNotComplete: '无法完成请求，请重试。' }
  };
  Object.entries(interfaceTranslations).forEach(([localeName, values]) => Object.assign(translations[localeName], values));
  Object.entries(marketplaceTranslations).forEach(([localeName, values]) => Object.assign(translations[localeName], values));
  const localCatalogueText = {
    'vi-VN': { trackCatalogueNav: 'Danh mục bài hát', recordingsToSearch: 'bài hát đã biết', trackCatalogueHeading: 'Danh mục bài hát', catalogueCountSuffix: 'bản nhạc đã biết, gồm bài mẫu và bài được Shazam nhận diện. Tin bán được hiển thị riêng.', knownTrack: 'BÀI HÁT ĐÃ BIẾT', searchKnownTracks: 'Tìm bài hát trong danh mục, lưu bài hát hoặc kiểm tra tin bán khác.', searchTrackCatalogue: 'Tìm danh mục bài hát' },
    'es-ES': { trackCatalogueNav: 'Catálogo de canciones', recordingsToSearch: 'canciones conocidas', trackCatalogueHeading: 'Catálogo de canciones', catalogueCountSuffix: 'canciones conocidas, incluidas las de muestra y las identificadas por Shazam. Las ofertas se muestran por separado.', knownTrack: 'CANCIÓN CONOCIDA', searchKnownTracks: 'Busca canciones en el catálogo, guárdalas o consulta otras ofertas.', searchTrackCatalogue: 'Buscar canciones' },
    'fr-FR': { trackCatalogueNav: 'Catalogue des titres', recordingsToSearch: 'titres connus', trackCatalogueHeading: 'Catalogue des titres', catalogueCountSuffix: 'titres connus, y compris les exemples et ceux reconnus par Shazam. Les offres sont affichées séparément.', knownTrack: 'TITRE CONNU', searchKnownTracks: 'Recherchez et enregistrez un titre, ou consultez les autres offres.', searchTrackCatalogue: 'Rechercher un titre' },
    'ja-JP': { trackCatalogueNav: '曲カタログ', recordingsToSearch: '登録済みの曲', trackCatalogueHeading: '曲カタログ', catalogueCountSuffix: '曲。デモ曲と Shazam で認識した曲が含まれます。販売中の商品は別に表示されます。', knownTrack: '登録済みの曲', searchKnownTracks: 'カタログで曲を検索して保存するか、他の出品を確認できます。', searchTrackCatalogue: '曲を検索' },
    'ko-KR': { trackCatalogueNav: '곡 카탈로그', recordingsToSearch: '등록된 곡', trackCatalogueHeading: '곡 카탈로그', catalogueCountSuffix: '곡이며 데모 곡과 Shazam에서 인식한 곡을 포함합니다. 판매 상품은 별도로 표시됩니다.', knownTrack: '등록된 곡', searchKnownTracks: '카탈로그에서 곡을 검색하고 저장하거나 다른 판매 목록을 확인하세요.', searchTrackCatalogue: '곡 카탈로그 검색' },
    'zh-CN': { trackCatalogueNav: '歌曲目录', recordingsToSearch: '首已知歌曲', trackCatalogueHeading: '歌曲目录', catalogueCountSuffix: '首已知歌曲，包括演示曲目和 Shazam 识别的歌曲。在售商品单独显示。', knownTrack: '已收录歌曲', searchKnownTracks: '搜索并收藏目录中的歌曲，或查看其他卖家商品。', searchTrackCatalogue: '搜索歌曲目录' }
  };
  Object.entries(localCatalogueText).forEach(([localeName, values]) => Object.assign(translations[localeName], values));
  const recognitionStateText = {
    'en-US': { noListingsYet: 'No listings yet.', listingsAvailable: 'Listings available.' },
    'en-GB': { noListingsYet: 'No listings yet.', listingsAvailable: 'Listings available.' },
    'vi-VN': { noListingsYet: 'Chưa có tin bán.', listingsAvailable: 'Đang có tin bán.' },
    'es-ES': { noListingsYet: 'Aún no hay anuncios.', listingsAvailable: 'Hay anuncios disponibles.' },
    'fr-FR': { noListingsYet: 'Aucune annonce pour le moment.', listingsAvailable: 'Des annonces sont disponibles.' },
    'ja-JP': { noListingsYet: '出品はまだありません。', listingsAvailable: '出品があります。' },
    'ko-KR': { noListingsYet: '아직 판매 목록이 없습니다.', listingsAvailable: '판매 목록이 있습니다.' },
    'zh-CN': { noListingsYet: '暂时没有商品。', listingsAvailable: '已有在售商品。' }
  };
  Object.entries(recognitionStateText).forEach(([localeName, values]) => Object.assign(translations[localeName], values));

  const productCopy = {
    'vi-VN': {
      sellIntro: 'Chọn bản phát hành, định dạng và tình trạng, sau đó nhập giá bán.', addDemoListing: 'Đăng tin bán',
      catalogueCountSuffix: 'bài hát đã được ghi nhận trong danh mục. Tin bán được hiển thị riêng.', searchKnownTracks: 'Tìm bài hát, lưu vào danh sách hoặc xem tin bán hiện có.',
      marketIntro: 'Tìm bài hát trong danh mục và xem các mặt hàng đang được người bán đăng bán.', noOffers: 'Chưa có tin bán. Hãy là người đầu tiên đăng bản phát hành này.',
      submitOrderRequest: 'Gửi yêu cầu mua hàng', cartDescription: 'Kiểm tra các mặt hàng đã chọn trước khi gửi yêu cầu mua hàng.', cartSubmitNote: 'Bạn sẽ nhận được mã tham chiếu sau khi gửi yêu cầu.', orderRequestRecorded: 'Đã nhận yêu cầu mua hàng. Mã tham chiếu:',
      purchaseRequestsDescription: 'Các yêu cầu được lưu theo tên người mua.', buyerSettingsDescription: 'Đặt tên dùng cho các yêu cầu mua hàng.', buyerPrivacyNote: 'Tên này được dùng để tra cứu các yêu cầu mua hàng của bạn.',
      setBuyerNameFirst: 'Hãy nhập tên người mua trước khi gửi yêu cầu.', buyerNameNeeded: 'Nhập tên người mua trong phần cài đặt để xem yêu cầu.',
      itemsMatchFilters: 'mặt hàng phù hợp với bộ lọc'
    },
    'es-ES': {
      sellIntro: 'Elige una edición, su formato y estado, e indica el precio.', addDemoListing: 'Publicar anuncio',
      catalogueCountSuffix: 'canciones en el catálogo. Los anuncios de vendedores aparecen por separado.', searchKnownTracks: 'Busca canciones, guárdalas o consulta los anuncios disponibles.',
      marketIntro: 'Busca canciones del catálogo y consulta los artículos publicados por vendedores.', noOffers: 'Aún no hay anuncios. Publica el primero para esta edición.',
      submitOrderRequest: 'Enviar solicitud de compra', cartDescription: 'Revisa los artículos seleccionados antes de enviar la solicitud.', cartSubmitNote: 'Recibirás un número de referencia al enviar la solicitud.', orderRequestRecorded: 'Solicitud de compra recibida. Referencia:',
      purchaseRequestsDescription: 'Solicitudes asociadas a tu nombre de comprador.', buyerSettingsDescription: 'Indica el nombre que se usará en tus solicitudes.', buyerPrivacyNote: 'El nombre se utiliza para consultar tus solicitudes de compra.',
      setBuyerNameFirst: 'Indica tu nombre antes de enviar la solicitud.', buyerNameNeeded: 'Añade un nombre en los ajustes para consultar tus solicitudes.',
      itemsMatchFilters: 'artículos coinciden con los filtros'
    },
    'fr-FR': {
      sellIntro: 'Choisissez une édition, son format et son état, puis indiquez le prix.', addDemoListing: 'Publier l’annonce',
      catalogueCountSuffix: 'titres dans le catalogue. Les annonces sont affichées séparément.', searchKnownTracks: 'Recherchez un titre, enregistrez-le ou consultez les annonces disponibles.',
      marketIntro: 'Recherchez un titre du catalogue et parcourez les articles proposés par les vendeurs.', noOffers: 'Aucune annonce pour le moment. Soyez le premier à proposer cette édition.',
      submitOrderRequest: 'Envoyer la demande d’achat', cartDescription: 'Vérifiez les articles sélectionnés avant d’envoyer votre demande.', cartSubmitNote: 'Un numéro de référence sera fourni après l’envoi.', orderRequestRecorded: 'Demande d’achat reçue. Référence :',
      purchaseRequestsDescription: 'Demandes associées à votre nom d’acheteur.', buyerSettingsDescription: 'Choisissez le nom utilisé pour vos demandes.', buyerPrivacyNote: 'Votre nom sert à retrouver vos demandes d’achat.',
      setBuyerNameFirst: 'Saisissez votre nom avant d’envoyer une demande.', buyerNameNeeded: 'Ajoutez un nom dans les paramètres pour consulter vos demandes.',
      itemsMatchFilters: 'articles correspondent aux filtres'
    },
    'ja-JP': {
      sellIntro: '作品と形式、状態を選び、販売価格を入力してください。', addDemoListing: '出品する',
      catalogueCountSuffix: '曲を収録しています。販売中の商品は別に表示されます。', searchKnownTracks: '曲を検索して保存するか、販売中の商品を確認できます。',
      marketIntro: 'カタログから曲を探し、出品中の商品を確認できます。', noOffers: '出品はまだありません。この作品を最初に出品できます。',
      submitOrderRequest: '購入リクエストを送信', cartDescription: '選択した商品を確認してから購入リクエストを送信してください。', cartSubmitNote: '送信後にリクエスト番号が表示されます。', orderRequestRecorded: '購入リクエストを受け付けました。番号：',
      purchaseRequestsDescription: '購入者名に関連付けられたリクエストです。', buyerSettingsDescription: 'リクエストに使用する名前を設定します。', buyerPrivacyNote: '入力した名前は購入リクエストの検索に使用します。',
      setBuyerNameFirst: '購入リクエストを送る前に名前を設定してください。', buyerNameNeeded: 'リクエストを確認するには設定で名前を入力してください。',
      itemsMatchFilters: '件の商品が条件に一致'
    },
    'ko-KR': {
      sellIntro: '발매작과 형식, 상태를 선택한 뒤 판매 가격을 입력하세요.', addDemoListing: '상품 등록',
      catalogueCountSuffix: '곡을 찾을 수 있습니다. 판매 상품은 별도로 표시됩니다.', searchKnownTracks: '곡을 검색해 저장하거나 판매 중인 상품을 확인하세요.',
      marketIntro: '카탈로그에서 곡을 찾고 판매자가 등록한 상품을 둘러보세요.', noOffers: '아직 판매 목록이 없습니다. 이 발매작을 처음 등록해 보세요.',
      submitOrderRequest: '구매 요청 보내기', cartDescription: '선택한 상품을 확인한 뒤 구매 요청을 보내세요.', cartSubmitNote: '요청을 보내면 참조 번호가 표시됩니다.', orderRequestRecorded: '구매 요청을 받았습니다. 참조 번호:',
      purchaseRequestsDescription: '구매자 이름으로 저장된 요청입니다.', buyerSettingsDescription: '구매 요청에 사용할 이름을 설정하세요.', buyerPrivacyNote: '이름은 구매 요청을 조회하는 데 사용됩니다.',
      setBuyerNameFirst: '요청을 보내기 전에 구매자 이름을 설정하세요.', buyerNameNeeded: '요청을 보려면 설정에 구매자 이름을 입력하세요.',
      itemsMatchFilters: '개 상품이 필터와 일치'
    },
    'zh-CN': {
      sellIntro: '选择发行版本、格式和品相，然后填写售价。', addDemoListing: '发布商品',
      catalogueCountSuffix: '首歌曲。卖家发布的商品会单独显示。', searchKnownTracks: '搜索歌曲、收藏歌曲或查看在售商品。',
      marketIntro: '从曲库中查找歌曲，并浏览卖家发布的商品。', noOffers: '暂无在售商品。你可以发布此发行版本的第一条商品。',
      submitOrderRequest: '提交购买请求', cartDescription: '确认所选商品后再提交购买请求。', cartSubmitNote: '提交后会显示请求编号。', orderRequestRecorded: '已收到购买请求。请求编号：',
      purchaseRequestsDescription: '与买家名称关联的请求。', buyerSettingsDescription: '设置购买请求使用的名称。', buyerPrivacyNote: '该名称用于查询你的购买请求。',
      setBuyerNameFirst: '请先设置买家名称，再提交请求。', buyerNameNeeded: '请在设置中填写买家名称以查看请求。',
      itemsMatchFilters: '件商品符合筛选条件'
    }
  };
  Object.entries(productCopy).forEach(([localeName, values]) => Object.assign(translations[localeName], values));

  const homeCopy = {
    'vi-VN': { activeMarketplaceListings: 'tin đăng đang mở', seeAllListings: 'Xem tất cả tin bán', homeCatalogueEmpty: 'Các bài hát được nhận diện sẽ xuất hiện tại đây.', homeOffersEmpty: 'Bạn vẫn có thể khám phá toàn bộ danh mục bài hát.', seeRelease: 'Xem bài hát', viewOffer: 'Xem tin bán' },
    'es-ES': { activeMarketplaceListings: 'anuncios disponibles', seeAllListings: 'Ver todos los anuncios', homeCatalogueEmpty: 'Aquí aparecerán las canciones identificadas.', homeOffersEmpty: 'También puedes explorar todo el catálogo.', seeRelease: 'Ver canción', viewOffer: 'Ver anuncio' },
    'fr-FR': { activeMarketplaceListings: 'annonces disponibles', seeAllListings: 'Voir toutes les annonces', homeCatalogueEmpty: 'Les titres reconnus apparaîtront ici.', homeOffersEmpty: 'Vous pouvez aussi parcourir tout le catalogue.', seeRelease: 'Voir le titre', viewOffer: 'Voir l’annonce' },
    'ja-JP': { activeMarketplaceListings: '販売中の商品', seeAllListings: 'すべての商品を見る', homeCatalogueEmpty: '認識した曲がここに表示されます。', homeOffersEmpty: '曲のカタログをすべてご覧いただけます。', seeRelease: '曲を見る', viewOffer: '商品を見る' },
    'ko-KR': { activeMarketplaceListings: '판매 중인 상품', seeAllListings: '전체 상품 보기', homeCatalogueEmpty: '인식한 곡이 여기에 표시됩니다.', homeOffersEmpty: '전체 곡 카탈로그를 둘러볼 수 있습니다.', seeRelease: '곡 보기', viewOffer: '상품 보기' },
    'zh-CN': { activeMarketplaceListings: '在售商品', seeAllListings: '查看全部商品', homeCatalogueEmpty: '识别到的歌曲会显示在这里。', homeOffersEmpty: '也可以继续浏览完整歌曲目录。', seeRelease: '查看歌曲', viewOffer: '查看商品' }
  };
  Object.entries(homeCopy).forEach(([localeName, values]) => Object.assign(translations[localeName], values));

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
  window.MelodexI18n = { base, translations, localeConfig };
})();
