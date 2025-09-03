const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto('https://www.nineonelabs.co.kr/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    // 컴포넌트 패턴 분석
    const componentAnalysis = await page.evaluate(() => {
      const getElementStyles = (el) => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          padding: styles.padding,
          margin: styles.margin,
          borderRadius: styles.borderRadius,
          border: styles.border,
          boxShadow: styles.boxShadow,
          display: styles.display,
          textAlign: styles.textAlign,
          lineHeight: styles.lineHeight
        };
      };
      
      // 버튼 패턴 분석
      const buttons = Array.from(document.querySelectorAll('button, .btn, a[class*="btn"], input[type="submit"]')).map(el => ({
        text: el.textContent.trim(),
        className: el.className,
        tagName: el.tagName.toLowerCase(),
        styles: getElementStyles(el)
      }));
      
      // 카드나 박스 패턴 분석
      const cards = Array.from(document.querySelectorAll('.card, .box, .item, [class*="card"], section > div')).slice(0, 10).map(el => ({
        className: el.className,
        tagName: el.tagName.toLowerCase(),
        styles: getElementStyles(el)
      }));
      
      // 네비게이션 패턴
      const navItems = Array.from(document.querySelectorAll('nav a, .nav a, .menu a, header a')).map(el => ({
        text: el.textContent.trim(),
        className: el.className,
        href: el.href,
        styles: getElementStyles(el)
      }));
      
      // 헤딩 스타일
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(el => ({
        tag: el.tagName.toLowerCase(),
        text: el.textContent.trim().substring(0, 50),
        className: el.className,
        styles: getElementStyles(el)
      }));
      
      // 간격 패턴 분석 - 간소화
      const spacingElements = Array.from(document.querySelectorAll('*')).slice(0, 50).map(el => {
        const styles = window.getComputedStyle(el);
        const margin = styles.margin;
        const padding = styles.padding;
        
        if (margin === '0px' && padding === '0px') {
          return null;
        }
        
        return {
          tagName: el.tagName.toLowerCase(),
          className: el.className,
          margin: margin,
          padding: padding,
          marginTop: styles.marginTop,
          marginBottom: styles.marginBottom,
          paddingTop: styles.paddingTop,
          paddingBottom: styles.paddingBottom
        };
      }).filter(item => item !== null);
      
      return {
        buttons,
        cards,
        navigation: navItems,
        headings,
        spacing: spacingElements
      };
    });
    
    // 레이아웃 구조 더 자세히 분석
    const layoutAnalysis = await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('.container, .wrapper, .main, .content, [class*="container"]')).map(el => {
        const styles = window.getComputedStyle(el);
        return {
          className: el.className,
          maxWidth: styles.maxWidth,
          width: styles.width,
          margin: styles.margin,
          padding: styles.padding,
          display: styles.display,
          flexDirection: styles.flexDirection,
          justifyContent: styles.justifyContent,
          alignItems: styles.alignItems,
          gridTemplateColumns: styles.gridTemplateColumns
        };
      });
      
      // 그리드나 플렉스 레이아웃
      const flexElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const styles = window.getComputedStyle(el);
        return styles.display === 'flex' || styles.display === 'grid';
      }).slice(0, 20).map(el => {
        const styles = window.getComputedStyle(el);
        return {
          tagName: el.tagName.toLowerCase(),
          className: el.className,
          display: styles.display,
          flexDirection: styles.flexDirection,
          justifyContent: styles.justifyContent,
          alignItems: styles.alignItems,
          gap: styles.gap,
          gridTemplateColumns: styles.gridTemplateColumns,
          gridTemplateRows: styles.gridTemplateRows
        };
      });
      
      return {
        containers,
        flexGridElements: flexElements
      };
    });
    
    const detailedAnalysis = {
      timestamp: new Date().toISOString(),
      url: 'https://www.nineonelabs.co.kr/',
      components: componentAnalysis,
      layout: layoutAnalysis
    };
    
    // 상세 분석 결과 저장
    fs.writeFileSync('nineonelabs-detailed-analysis.json', JSON.stringify(detailedAnalysis, null, 2));
    console.log('상세 분석 결과가 nineonelabs-detailed-analysis.json 파일로 저장되었습니다.');
    console.log('발견된 버튼 수:', componentAnalysis.buttons.length);
    console.log('발견된 카드/박스 수:', componentAnalysis.cards.length);
    console.log('발견된 네비게이션 항목 수:', componentAnalysis.navigation.length);
    console.log('발견된 헤딩 수:', componentAnalysis.headings.length);
    
  } catch (error) {
    console.error('상세 분석 중 오류 발생:', error);
  } finally {
    await browser.close();
  }
})();