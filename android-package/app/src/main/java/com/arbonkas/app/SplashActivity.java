package com.arbonkas.app;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.content.Intent;
import android.view.animation.Animation;
import android.view.animation.AlphaAnimation;
import android.view.animation.ScaleAnimation;
import android.view.animation.AnimationSet;
import android.widget.ImageView;
import android.widget.TextView;
import android.util.Log;

public class SplashActivity extends Activity {
    
    private static final int INTRO_DURATION_MS = 2700;
    private WelcomeScreenOrchestrator orchestrator;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        setContentView(R.layout.activity_splash);
        
        orchestrator = new WelcomeScreenOrchestrator(this, INTRO_DURATION_MS);
        orchestrator.execute();
    }

    private static class WelcomeScreenOrchestrator {
        private Activity context;
        private int durationMs;
        private VisualEffectsEngine effectsEngine;
        private NavigationScheduler navScheduler;
        
        WelcomeScreenOrchestrator(Activity ctx, int duration) {
            this.context = ctx;
            this.durationMs = duration;
        }
        
        void execute() {
            ImageView logoImg = context.findViewById(R.id.brand_logo_image);
            TextView titleTxt = context.findViewById(R.id.application_title);
            TextView descTxt = context.findViewById(R.id.application_description);
            
            effectsEngine = new VisualEffectsEngine(logoImg, titleTxt, descTxt);
            effectsEngine.applyEffects();
            
            navScheduler = new NavigationScheduler(context, durationMs);
            navScheduler.schedule();
            
            Log.i("ArBonKas_Init", "Welcome orchestration started");
        }
        
        void cancel() {
            if (navScheduler != null) {
                navScheduler.cancel();
            }
        }
        
        private static class VisualEffectsEngine {
            private ImageView logoView;
            private TextView titleView;
            private TextView descView;
            
            VisualEffectsEngine(ImageView logo, TextView title, TextView desc) {
                this.logoView = logo;
                this.titleView = title;
                this.descView = desc;
            }
            
            void applyEffects() {
                if (logoView != null) {
                    applyLogoEffect();
                }
                if (titleView != null) {
                    applyTitleEffect();
                }
                if (descView != null) {
                    applyDescEffect();
                }
            }
            
            private void applyLogoEffect() {
                AnimationSet combo = new AnimationSet(true);
                combo.setDuration(1300);
                
                AlphaAnimation alpha = new AlphaAnimation(0.0f, 1.0f);
                alpha.setDuration(1300);
                
                ScaleAnimation scale = new ScaleAnimation(
                    0.3f, 1.0f, 0.3f, 1.0f,
                    Animation.RELATIVE_TO_SELF, 0.5f,
                    Animation.RELATIVE_TO_SELF, 0.5f
                );
                scale.setDuration(1300);
                
                combo.addAnimation(alpha);
                combo.addAnimation(scale);
                logoView.startAnimation(combo);
            }
            
            private void applyTitleEffect() {
                AlphaAnimation alpha = new AlphaAnimation(0.0f, 1.0f);
                alpha.setDuration(950);
                alpha.setStartOffset(450);
                titleView.startAnimation(alpha);
            }
            
            private void applyDescEffect() {
                AlphaAnimation alpha = new AlphaAnimation(0.0f, 1.0f);
                alpha.setDuration(950);
                alpha.setStartOffset(750);
                descView.startAnimation(alpha);
            }
        }
        
        private static class NavigationScheduler {
            private Handler handler;
            private Activity activity;
            private boolean executed = false;
            private int delay;
            
            NavigationScheduler(Activity act, int delayMs) {
                this.activity = act;
                this.delay = delayMs;
                this.handler = new Handler(Looper.getMainLooper());
            }
            
            void schedule() {
                handler.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        navigate();
                    }
                }, delay);
            }
            
            private void navigate() {
                if (executed) return;
                executed = true;
                
                Intent intent = new Intent(activity, MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                activity.startActivity(intent);
                activity.overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
                activity.finish();
                
                Log.i("ArBonKas_Init", "Navigation executed");
            }
            
            void cancel() {
                if (handler != null) {
                    handler.removeCallbacksAndMessages(null);
                }
            }
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (orchestrator != null) {
            orchestrator.cancel();
        }
    }

    @Override
    protected void onDestroy() {
        if (orchestrator != null) {
            orchestrator.cancel();
            orchestrator = null;
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        // Block back during intro
    }
}
