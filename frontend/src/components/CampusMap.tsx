import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./CampusMap.css";

// Leaflet 기본 마커 아이콘 수정 (Vite 번들링 이슈 해결)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// 숙명여대 1캠퍼스 + 2캠퍼스 모두 포함하는 중심 좌표
const CAMPUS_CENTER: L.LatLngTuple = [37.5462, 126.9647];
// 1캠 + 2캠 전체를 포함하는 넓은 bounds
const CAMPUS_BOUNDS = L.latLngBounds(
  [37.5420, 126.9590], // 남서 (2캠 포함)
  [37.5510, 126.9710]  // 북동
);

interface Place {
  name: string;
  type: string;
  description: string;
  lat: string;
  lng: string;
}

export default function CampusMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [locating, setLocating] = useState(false);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: CAMPUS_CENTER,
      zoom: 16,
      minZoom: 15,
      maxZoom: 19,
      maxBounds: CAMPUS_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    // n8n webhook에서 배리어프리 장소 데이터 가져오기
    fetch("https://xn---n8n-9d8pu22f1rl/webhook/barrier-free-map")
      .then((res) => res.json())
      .then((data: Place[]) => {
        setPlaces(data);
        setFilteredPlaces(data);
        addMarkers(data, map);
      })
      .catch(() => {
        // API 실패 시 기본 데이터 사용
        const fallbackData: Place[] = [
          { name: "학생회관", type: "편의시설", description: "엘리베이터, 경사로 완비", lat: "37.5460", lng: "126.9640" },
          { name: "중앙도서관", type: "편의시설", description: "엘리베이터, 장애인 화장실", lat: "37.5468", lng: "126.9650" },
          { name: "순헌관", type: "강의동", description: "엘리베이터 이용 가능", lat: "37.5455", lng: "126.9655" },
          { name: "명신관", type: "강의동", description: "엘리베이터, 평탄한 보도 연결", lat: "37.5472", lng: "126.9643" },
          { name: "제2캠퍼스 르네상스플라자", type: "편의시설", description: "엘리베이터, 경사로, 장애인 화장실", lat: "37.5463", lng: "126.9608" },
          { name: "제2캠퍼스 백주년기념관", type: "강의동", description: "엘리베이터 이용 가능", lat: "37.5458", lng: "126.9615" },
        ];
        setPlaces(fallbackData);
        setFilteredPlaces(fallbackData);
        addMarkers(fallbackData, map);
      });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // 마커 추가 함수
  function addMarkers(data: Place[], map: L.Map) {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    data.forEach((place) => {
      const lat = Number(place.lat);
      const lng = Number(place.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(
          `<b>${place.name}</b><br>${place.type}<br>${place.description}`
        );
      markersRef.current.push(marker);
    });
  }

  // 현재 위치 표시
  const handleLocateMe = () => {
    if (!mapInstance.current) return;
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const map = mapInstance.current!;

        // 기존 사용자 마커 제거
        if (userMarkerRef.current) {
          userMarkerRef.current.remove();
        }

        // 사용자 위치 마커 (파란 원)
        const userIcon = L.divIcon({
          className: "user-location-marker",
          html: '<div class="user-dot"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const userMarker = L.marker([latitude, longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup("📍 현재 내 위치");

        userMarkerRef.current = userMarker;

        // 캠퍼스 범위 안이면 해당 위치로 이동, 아니면 알림
        if (CAMPUS_BOUNDS.contains([latitude, longitude])) {
          map.setView([latitude, longitude], 18);
          userMarker.openPopup();
        } else {
          // 범위 밖이어도 마커는 표시하되 캠퍼스 중심 유지
          map.setView(CAMPUS_CENTER, 18);
          userMarker.openPopup();
        }

        setLocating(false);
      },
      () => {
        alert("위치 정보를 가져올 수 없습니다. 위치 권한을 확인해 주세요.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 검색 처리
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const q = query.trim().toLowerCase();

    if (!q) {
      setFilteredPlaces(places);
      if (mapInstance.current) {
        addMarkers(places, mapInstance.current);
      }
      return;
    }

    const filtered = places.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
    setFilteredPlaces(filtered);

    if (mapInstance.current) {
      addMarkers(filtered, mapInstance.current);
      if (filtered.length === 1) {
        mapInstance.current.setView(
          [Number(filtered[0].lat), Number(filtered[0].lng)],
          18
        );
      }
    }
  };

  // 장소 클릭 시 지도 이동
  const handlePlaceClick = (place: Place) => {
    if (mapInstance.current) {
      mapInstance.current.setView([Number(place.lat), Number(place.lng)], 18);
      const idx = filteredPlaces.indexOf(place);
      if (markersRef.current[idx]) {
        markersRef.current[idx].openPopup();
      }
    }
  };

  return (
    <div className="campus-map-wrapper">
      {/* 지도 */}
      <div className="map-container" ref={mapRef}>
        {/* 현재 위치 버튼 (지도 위 오버레이) */}
        <button
          className="locate-btn"
          onClick={handleLocateMe}
          disabled={locating}
          aria-label="현재 위치 보기"
          title="현재 위치 보기"
        >
          {locating ? "⏳" : "📍"}
        </button>
      </div>

      {/* 검색바 (지도 아래) */}
      <div className="map-search-area">
        <div className="map-search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="건물명 또는 시설 검색..."
            className="map-search-input"
            aria-label="캠퍼스 내 장소 검색"
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => handleSearch("")}
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>

        {/* 검색 결과 리스트 */}
        {searchQuery && filteredPlaces.length > 0 && (
          <ul className="search-results">
            {filteredPlaces.map((place, i) => (
              <li key={i} onClick={() => handlePlaceClick(place)}>
                <strong>{place.name}</strong>
                <span className="place-type">{place.type}</span>
                <span className="place-desc">{place.description}</span>
              </li>
            ))}
          </ul>
        )}
        {searchQuery && filteredPlaces.length === 0 && (
          <p className="no-results">검색 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
