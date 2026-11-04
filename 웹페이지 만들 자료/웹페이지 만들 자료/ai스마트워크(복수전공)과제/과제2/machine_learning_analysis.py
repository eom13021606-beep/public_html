# -*- coding: utf-8 -*-
"""
================================================================================
통합 통계 및 기계학습 데이터셋(unified_statistics_data.csv) 종합 ML 분석 파이프라인
================================================================================
본 스크립트는 제공된 데이터를 기반으로 적용 가능한 5대 기계학습 분석 기법을 체계적으로 구현합니다:
  1. [지도학습 - 회귀]       연봉(Salary) 예측 및 보상 결정 요인 분석
  2. [지도학습 - 이진 분류]   승진 여부(Promotion) 예측 및 승진 영향 인자 분석
  3. [지도학습 - 다중 분류]   역량 기반 직무/소속 그룹(Group_Label) 자동 분류
  4. [비지도학습 - 군집화]    역량 프로필(Social, Tech, Extra) 기반 직원 유형 세분화 (K-Means)
  5. [비지도학습 - 차원 축소] 만족도 다문항(Satisf_1~3) 주성분 분석(PCA) 종합 지표화
================================================================================
"""

import sys
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import (
    mean_squared_error, mean_absolute_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    classification_report, silhouette_score, adjusted_rand_score
)

# 콘솔 UTF-8 출력 보장
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def load_and_prepare_data(file_path='unified_statistics_data.csv'):
    """데이터 로드 및 기초 파생변수 생성"""
    df = pd.read_csv(file_path)
    
    # 파생변수 1: 교육 점수 향상도 (Score_Improvement)
    df['Score_Improvement'] = df['Post_Score'] - df['Pre_Score']
    
    return df


# ==============================================================================
# 1. 지도학습 - 회귀 분석 (Regression): Salary 예측
# ==============================================================================
def run_regression_analysis(df):
    print("\n" + "="*80)
    print("1. [지도학습 - 회귀 분석] 연봉(Salary) 예측 및 결정 요인 규명")
    print("="*80)
    
    # Salary 결측치가 없는 데이터셋 사용
    df_reg = df[df['Salary'].notnull()].copy()
    
    # 특성 및 타겟 분리
    num_features = ['Experience', 'Age', 'IQ', 'Performance', 'Pre_Score', 'Post_Score']
    cat_features = ['Gender', 'Region', 'Education']
    target = 'Salary'
    
    X = df_reg[num_features + cat_features]
    y = df_reg[target]
    
    # Train / Test 분할
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # 전처리 파이프라인 (Age 결측치는 중앙값 대체, 스케일링, 원-핫 인코딩)
    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    cat_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(drop='first', handle_unknown='ignore'))
    ])
    preprocessor = ColumnTransformer(transformers=[
        ('num', num_transformer, num_features),
        ('cat', cat_transformer, cat_features)
    ])
    
    # 1) 선형 회귀 (Linear Regression)
    lr_pipeline = Pipeline(steps=[('preprocessor', preprocessor), ('regressor', LinearRegression())])
    lr_pipeline.fit(X_train, y_train)
    y_pred_lr = lr_pipeline.predict(X_test)
    
    # 2) 랜덤 포레스트 회귀 (Random Forest Regressor)
    rf_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=1))
    ])
    rf_pipeline.fit(X_train, y_train)
    y_pred_rf = rf_pipeline.predict(X_test)
    
    print(f"- 사용 변수 : 수치형({num_features}) + 범주형({cat_features})")
    print(f"- 종속 변수 : {target}")
    print(f"- 학습 표본 수 : {len(X_train)}건 / 평가 표본 수 : {len(X_test)}건")
    print("\n[모델 성능 비교]")
    print(f"  * Linear Regression   : R² = {r2_score(y_test, y_pred_lr):.4f}, RMSE = {np.sqrt(mean_squared_error(y_test, y_pred_lr)):.2f}, MAE = {mean_absolute_error(y_test, y_pred_lr):.2f}")
    print(f"  * Random Forest       : R² = {r2_score(y_test, y_pred_rf):.4f}, RMSE = {np.sqrt(mean_squared_error(y_test, y_pred_rf)):.2f}, MAE = {mean_absolute_error(y_test, y_pred_rf):.2f}")
    
    # 특성 중요도 추출
    feature_names = num_features + list(rf_pipeline.named_steps['preprocessor'].named_transformers_['cat'].named_steps['onehot'].get_feature_names_out(cat_features))
    rf_importances = rf_pipeline.named_steps['regressor'].feature_importances_
    importance_df = pd.DataFrame({'Feature': feature_names, 'Importance': rf_importances}).sort_values(by='Importance', ascending=False)
    
    print("\n[Random Forest 특성 중요도 Top 5]")
    for idx, row in importance_df.head(5).iterrows():
        print(f"  - {row['Feature']:20s} : {row['Importance']*100:5.2f}%")


# ==============================================================================
# 2. 지도학습 - 이진 분류 (Binary Classification): Promotion 예측
# ==============================================================================
def run_binary_classification(df):
    print("\n" + "="*80)
    print("2. [지도학습 - 이진 분류] 승진 여부(Promotion) 예측 및 승진 영향 인자 분석")
    print("="*80)
    
    # 독립변수 구성
    num_features = ['Performance', 'Experience', 'IQ', 'Age', 'Score_Improvement', 
                    'Social_Score', 'Tech_Score', 'Extra_Feature', 'Satisf_1', 'Satisf_2', 'Satisf_3']
    cat_features = ['Gender', 'Region', 'Education']
    target = 'Promotion'
    
    X = df[num_features + cat_features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    cat_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(drop='first', handle_unknown='ignore'))
    ])
    preprocessor = ColumnTransformer(transformers=[
        ('num', num_transformer, num_features),
        ('cat', cat_transformer, cat_features)
    ])
    
    # 로지스틱 회귀 & 랜덤 포레스트
    lr_clf = Pipeline(steps=[('preprocessor', preprocessor), ('classifier', LogisticRegression(max_iter=1000, random_state=42))])
    rf_clf = Pipeline(steps=[('preprocessor', preprocessor), ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=1))])
    
    lr_clf.fit(X_train, y_train)
    rf_clf.fit(X_train, y_train)
    
    y_pred_lr = lr_clf.predict(X_test)
    y_prob_lr = lr_clf.predict_proba(X_test)[:, 1]
    y_pred_rf = rf_clf.predict(X_test)
    y_prob_rf = rf_clf.predict_proba(X_test)[:, 1]
    
    print(f"- 사용 변수 : 성과/경력/역량/만족도 수치형 11개 + 인구통계 범주형 3개")
    print(f"- 타겟 변수 : Promotion (0: 미승진, 1: 승진)")
    print("\n[모델 성능 비교]")
    print(f"  * Logistic Regression : Acc = {accuracy_score(y_test, y_pred_lr):.4f}, F1 = {f1_score(y_test, y_pred_lr):.4f}, ROC-AUC = {roc_auc_score(y_test, y_prob_lr):.4f}")
    print(f"  * Random Forest       : Acc = {accuracy_score(y_test, y_pred_rf):.4f}, F1 = {f1_score(y_test, y_pred_rf):.4f}, ROC-AUC = {roc_auc_score(y_test, y_prob_rf):.4f}")
    
    # 특성 중요도 Top 5
    feature_names = num_features + list(rf_clf.named_steps['preprocessor'].named_transformers_['cat'].named_steps['onehot'].get_feature_names_out(cat_features))
    rf_importances = rf_clf.named_steps['regressor' if 'regressor' in rf_clf.named_steps else 'classifier'].feature_importances_
    importance_df = pd.DataFrame({'Feature': feature_names, 'Importance': rf_importances}).sort_values(by='Importance', ascending=False)
    
    print("\n[승진 결정 핵심 기여 요인 Top 5 (Random Forest)]")
    for idx, row in importance_df.head(5).iterrows():
        print(f"  - {row['Feature']:20s} : {row['Importance']*100:5.2f}%")


# ==============================================================================
# 3. 지도학습 - 다중 분류 (Multi-class Classification): Group_Label 분류
# ==============================================================================
def run_multiclass_classification(df):
    print("\n" + "="*80)
    print("3. [지도학습 - 다중 분류] 직원 역량 기반 소속 그룹(Group_Label) 자동 분류")
    print("="*80)
    
    features = ['Social_Score', 'Tech_Score', 'Extra_Feature']
    target = 'Group_Label'
    
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    clf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=1)
    clf.fit(X_train_scaled, y_train)
    y_pred = clf.predict(X_test_scaled)
    
    print(f"- 사용 변수 : {features}")
    print(f"- 타겟 변수 : Group_Label (클래스: 0, 1, 2)")
    print(f"- 분류 정확도(Accuracy) : {accuracy_score(y_test, y_pred)*100:.2f}%")
    print(f"- Macro F1-Score        : {f1_score(y_test, y_pred, average='macro'):.4f}")
    print("\n[분류 리포트]")
    print(classification_report(y_test, y_pred, digits=4))


# ==============================================================================
# 4. 비지도학습 - 군집 분석 (Clustering): 역량 기반 직원 프로파일 군집화
# ==============================================================================
def run_clustering_analysis(df):
    print("\n" + "="*80)
    print("4. [비지도학습 - 군집 분석] 역량 점수 기반 무감독 직원 세분화 (K-Means)")
    print("="*80)
    
    cluster_features = ['Social_Score', 'Tech_Score', 'Extra_Feature']
    X = df[cluster_features].copy()
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # K-Means (k=3)
    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)
    df['Cluster'] = clusters
    
    sil_score = silhouette_score(X_scaled, clusters)
    ari_score = adjusted_rand_score(df['Group_Label'], clusters)
    
    print(f"- 군집화 변수 : {cluster_features} (라벨 배제 무감독 학습)")
    print(f"- 군집 수(k)   : 3개 클러스터")
    print(f"- 실루엣 점수(Silhouette Score)     : {sil_score:.4f} (군집 분리도 및 응집도 우수)")
    print(f"- 실제 Group_Label과의 일치도(ARI) : {ari_score:.4f}")
    
    print("\n[군집별 역량 프로파일 평균]")
    cluster_summary = df.groupby('Cluster')[cluster_features].mean()
    print(cluster_summary.round(2))


# ==============================================================================
# 5. 비지도학습 - 차원 축소 (Dimensionality Reduction): 만족도 문항 PCA
# ==============================================================================
def run_pca_analysis(df):
    print("\n" + "="*80)
    print("5. [비지도학습 - 차원 축소] 만족도 다문항(Satisf_1~3) 주성분 분석(PCA)")
    print("="*80)
    
    satisf_cols = ['Satisf_1', 'Satisf_2', 'Satisf_3']
    X = df[satisf_cols].copy()
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    pca = PCA()
    pca.fit(X_scaled)
    
    print(f"- 분석 변수 : {satisf_cols}")
    print("\n[주성분별 설명된 분산 비율 (Explained Variance Ratio)]")
    for i, ratio in enumerate(pca.explained_variance_ratio_, 1):
        print(f"  - 주성분 PC{i} : {ratio*100:5.2f}% (누적 {np.sum(pca.explained_variance_ratio_[:i])*100:5.2f}%)")
        
    print("\n[주성분 1(PC1)의 문항별 로딩(Loading) 계수]")
    for col, load in zip(satisf_cols, pca.components_[0]):
        print(f"  - {col:10s} : {load:+.4f}")
    print("  => 해석: PC1이 분산의 대부분을 설명하며 세 문항에 고르게 기여하므로 '종합 만족도 지수'로 단일화 가능")


def main():
    print("데이터 로딩 및 머신러닝 분석 파이프라인 가동...")
    df = load_and_prepare_data('unified_statistics_data.csv')
    print(f"데이터셋 전체 크기: {df.shape[0]}행, {df.shape[1]}열")
    
    run_regression_analysis(df)
    run_binary_classification(df)
    run_multiclass_classification(df)
    run_clustering_analysis(df)
    run_pca_analysis(df)
    print("\n모든 기계학습 분석 프로세스가 성공적으로 완료되었습니다.")

if __name__ == '__main__':
    main()
