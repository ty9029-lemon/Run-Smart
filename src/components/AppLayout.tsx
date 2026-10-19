import { Outlet } from 'react-router-dom';
import { TAB_BAR_OFFSET } from '../constants/navigation';
import BottomTabBar from './BottomTabBar';

/** 온보딩 이후 화면의 공통 레이아웃: 본문 + 하단 탭바 (탭바에 가리지 않도록 하단 여백 확보) */
export default function AppLayout() {
  return (
    <>
      <div style={{ paddingBottom: TAB_BAR_OFFSET }}>
        <Outlet />
      </div>
      <BottomTabBar />
    </>
  );
}
