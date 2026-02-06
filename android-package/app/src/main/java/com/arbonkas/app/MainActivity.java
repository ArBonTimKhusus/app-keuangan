package com.arbonkas.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.view.KeyEvent;
import android.widget.ProgressBar;
import android.util.Log;
import android.net.Uri;
import android.view.View;
import java.util.HashMap;
import java.util.Map;

/**
 * ArBonKas - Main Activity
 * Aplikasi Laporan Keuangan untuk ArBon Carbon Modifikasi
 */
public class MainActivity extends Activity {

    private WebViewConfiguration webConfig;
    private ProgressVisibilityController progressController;
    private static final String ARBONKAS_TRACE = "FinancialApp";
    private static final int PROGRESS_THRESHOLD = 98;
    private Map<String, Long> performanceMetrics;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.activity_main);

        performanceMetrics = new HashMap<>();
        performanceMetrics.put("startTime", System.currentTimeMillis());

        webConfig = new WebViewConfiguration(this);
        webConfig.assembleComponents();
        webConfig.applyOptimizations();
        webConfig.loadFinancialData();
    }

    private class WebViewConfiguration {
        private WebView contentEngine;
        private Activity parentContext;
        private UrlProtectionLayer urlProtector;
        private LoadingProgressHandler progressHandler;

        WebViewConfiguration(Activity context) {
            this.parentContext = context;
        }

        void assembleComponents() {
            contentEngine = parentContext.findViewById(R.id.financial_content_view);
            ProgressBar indicator = parentContext.findViewById(R.id.load_progress_indicator);

            if (contentEngine == null) {
                Log.e(ARBONKAS_TRACE, "WebView component missing from layout");
                parentContext.finish();
                return;
            }

            progressController = new ProgressVisibilityController(indicator);
            urlProtector = new UrlProtectionLayer(contentEngine, progressController);
            progressHandler = new LoadingProgressHandler(progressController);
        }

        void applyOptimizations() {
            if (contentEngine == null) return;

            WebSettings engineSettings = contentEngine.getSettings();

            engineSettings.setJavaScriptEnabled(true);
            engineSettings.setDomStorageEnabled(true);
            engineSettings.setDatabaseEnabled(true);
            engineSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
            engineSettings.setSupportZoom(false);
            engineSettings.setBuiltInZoomControls(false);
            engineSettings.setDisplayZoomControls(false);
            engineSettings.setLoadWithOverviewMode(true);
            engineSettings.setUseWideViewPort(true);

            contentEngine.setLayerType(View.LAYER_TYPE_HARDWARE, null);
            contentEngine.setScrollBarStyle(View.SCROLLBARS_INSIDE_OVERLAY);

            contentEngine.setWebViewClient(urlProtector);
            contentEngine.setWebChromeClient(progressHandler);

            Log.i(ARBONKAS_TRACE, "Optimizations applied");
        }

        void loadFinancialData() {
            if (contentEngine == null) return;

            String assetLocation = "file:///android_asset/index.html";

            try {
                contentEngine.loadUrl(assetLocation);
                performanceMetrics.put("loadInitiated", System.currentTimeMillis());
                Log.d(ARBONKAS_TRACE, "Loading: " + assetLocation);
            } catch (Exception loadError) {
                Log.e(ARBONKAS_TRACE, "Load error: " + loadError.toString());
                displayEmergencyContent();
            }
        }

        void displayEmergencyContent() {
            if (contentEngine == null) return;

            StringBuilder htmlBuilder = new StringBuilder();
            htmlBuilder.append("<html><head>");
            htmlBuilder.append("<style>body{font-family:sans-serif;text-align:center;padding:70px;background:#f8f8f8;color:#333;}</style>");
            htmlBuilder.append("</head><body>");
            htmlBuilder.append("<h1 style='color:#4CAF50;'>ArBonKas</h1>");
            htmlBuilder.append("<p>Financial data temporarily unavailable</p>");
            htmlBuilder.append("</body></html>");

            contentEngine.loadData(htmlBuilder.toString(), "text/html", "UTF-8");
        }

        WebView getEngine() {
            return contentEngine;
        }
    }

    private class UrlProtectionLayer extends WebViewClient {
        private ProgressVisibilityController visibilityManager;

        UrlProtectionLayer(WebView engine, ProgressVisibilityController manager) {
            this.visibilityManager = manager;
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
            Uri destination = req.getUrl();
            String protocol = destination.getScheme();

            boolean isFileProtocol = "file".equals(protocol);

            if (isFileProtocol) {
                Log.d(ARBONKAS_TRACE, "Allowed: " + destination.toString());
                return false;
            }

            Log.w(ARBONKAS_TRACE, "Blocked: " + destination.toString());
            return true;
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            visibilityManager.hideProgress();
            performanceMetrics.put("loadCompleted", System.currentTimeMillis());

            Long loadInitiated = performanceMetrics.get("loadInitiated");
            Long loadCompleted = performanceMetrics.get("loadCompleted");
            if (loadInitiated != null && loadCompleted != null) {
                long loadTime = loadCompleted - loadInitiated;
                Log.i(ARBONKAS_TRACE, "Page ready in " + loadTime + "ms: " + url);
            }
        }

        @Override
        public void onReceivedError(WebView view, int code, String desc, String url) {
            Log.e(ARBONKAS_TRACE, "Error " + code + ": " + desc);
            if (webConfig != null) {
                webConfig.displayEmergencyContent();
            }
        }
    }

    private class LoadingProgressHandler extends WebChromeClient {
        private ProgressVisibilityController controller;

        LoadingProgressHandler(ProgressVisibilityController ctrl) {
            this.controller = ctrl;
        }

        @Override
        public void onProgressChanged(WebView view, int progress) {
            if (progress >= PROGRESS_THRESHOLD) {
                controller.hideProgress();
            } else {
                controller.showProgress(progress);
            }
        }
    }

    private static class ProgressVisibilityController {
        private ProgressBar progressWidget;

        ProgressVisibilityController(ProgressBar widget) {
            this.progressWidget = widget;
        }

        void showProgress(int value) {
            if (progressWidget != null) {
                progressWidget.setVisibility(View.VISIBLE);
                progressWidget.setProgress(value);
            }
        }

        void hideProgress() {
            if (progressWidget != null) {
                progressWidget.setVisibility(View.GONE);
            }
        }
    }

    @Override
    public boolean onKeyDown(int code, KeyEvent event) {
        boolean backPressed = code == KeyEvent.KEYCODE_BACK;
        WebView engine = webConfig != null ? webConfig.getEngine() : null;

        if (backPressed && engine != null && engine.canGoBack()) {
            engine.goBack();
            return true;
        }

        return super.onKeyDown(code, event);
    }

    @Override
    protected void onPause() {
        super.onPause();
        WebView engine = webConfig != null ? webConfig.getEngine() : null;

        if (engine != null) {
            engine.onPause();
            engine.pauseTimers();
            Log.d(ARBONKAS_TRACE, "Paused");
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        WebView engine = webConfig != null ? webConfig.getEngine() : null;

        if (engine != null) {
            engine.onResume();
            engine.resumeTimers();
            Log.d(ARBONKAS_TRACE, "Resumed");
        }
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
        Log.w(ARBONKAS_TRACE, "Memory warning");

        WebView engine = webConfig != null ? webConfig.getEngine() : null;
        if (engine != null) {
            engine.clearCache(true);
            engine.clearHistory();
            engine.clearFormData();
        }
    }

    @Override
    protected void onDestroy() {
        WebView engine = webConfig != null ? webConfig.getEngine() : null;

        if (engine != null) {
            engine.clearHistory();
            engine.clearCache(true);
            engine.loadUrl("about:blank");
            engine.removeAllViews();
            engine.destroy();
        }

        webConfig = null;
        progressController = null;
        if (performanceMetrics != null) {
            performanceMetrics.clear();
        }

        Log.i(ARBONKAS_TRACE, "Destroyed");
        super.onDestroy();
    }
}
