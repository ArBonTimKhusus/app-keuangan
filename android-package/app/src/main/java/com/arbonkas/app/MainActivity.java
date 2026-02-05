package com.arbonkas.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.view.KeyEvent;

/**
 * ArBonKas - Main Activity
 * Aplikasi Laporan Keuangan untuk ArBon Carbon Modifikasi
 */
public class MainActivity extends Activity {
    
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize WebView
        webView = findViewById(R.id.webview);
        
        // Configure WebView settings
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Set WebView client to handle page navigation
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });
        
        // Set WebChromeClient for additional features
        webView.setWebChromeClient(new WebChromeClient());
        
        // Load the main HTML file from assets
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        // Handle back button to navigate WebView history
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
