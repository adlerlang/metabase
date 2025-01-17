(ns metabase-enterprise.serialization.api.serialize-test
  (:require
   [clojure.test :refer :all]
   [metabase.models :refer [Card Collection Dashboard DashboardCard]]
   [metabase.public-settings.premium-features-test
    :as premium-features-test]
   [metabase.test :as mt]
   [metabase.util.files :as u.files]
   [toucan.db :as db]))

(defn- do-serialize-data-model [f]
  (premium-features-test/with-premium-features #{:serialization}
    (mt/with-temp* [Collection    [{collection-id :id}]
                    Dashboard     [{dashboard-id :id} {:collection_id collection-id}]
                    Card          [{card-id :id}      {:collection_id collection-id}]
                    DashboardCard [_                  {:card_id card-id, :dashboard_id dashboard-id}]]
      (testing "Sanity Check"
        (is (integer? collection-id))
        (is (= collection-id
               (db/select-one-field :collection_id Card :id card-id))))
      (mt/with-temp-dir [dir "serdes-dir"]
        (f {:collection-id collection-id, :dir dir})))))

(deftest serialize-data-model-happy-path-test
  (do-serialize-data-model
   (fn [{:keys [collection-id dir]}]
     (is (= {:status "ok"}
            (mt/user-http-request :crowberto :post 200 "ee/serialization/serialize/data-model"
                                  {:collection_ids [collection-id]
                                   :path           dir})))
     (testing "Created files"
       (letfn [(path-files [path]
                 (sort (map str (u.files/files-seq path))))
               (files [& path-components]
                 (path-files (apply u.files/get-path dir path-components)))]
         (is (= ["/tmp/serdes-dir/Card"
                 "/tmp/serdes-dir/Collection"
                 "/tmp/serdes-dir/Dashboard"
                 "/tmp/serdes-dir/settings.yaml"]
                (files)))
         (testing "subdirs"
           (testing "Card"
             (is (= 1
                    (count (files "Card")))))
           (testing "Collection"
             (is (= 1
                    (count (files "Collection")))))
           (testing "Dashboard"
             (is (= 2
                    (count (files "Dashboard"))))
             (let [[f1 f2]         (files "Dashboard")
                   [path-1 path-2] (map u.files/get-path [f1 f2])]
               (testing "Should have one subdirectory"
                 (is (= 1
                        (count (filter true? (map u.files/regular-file? [path-1 path-2]))))))
               (let [subdirectory-path (first (remove u.files/regular-file? [path-1 path-2]))]
                 (is (= 1
                        (count (path-files subdirectory-path)))))))))))))

(deftest serialize-data-model-validation-test
  (do-serialize-data-model
   (fn [{:keys [collection-id dir]}]
     (let [good-request {:collection_ids [collection-id]
                         :path           dir}
           serialize!   (fn [& {:keys [expected-status-code
                                       request
                                       user]
                                :or   {expected-status-code 400
                                       request              good-request
                                       user                 :crowberto}}]
                          (mt/user-http-request user :post expected-status-code "ee/serialization/serialize/data-model"
                                                request))]
       (testing "Require a EE token with the `:serialization` feature"
         (premium-features-test/with-premium-features #{}
           (is (= "This API endpoint is only enabled if you have a premium token with the :serialization feature."
                  (serialize! :expected-status-code 402)))))
       (testing "Require current user to be a superuser"
         (is (= "You don't have permissions to do that."
                (serialize! :user :rasta, :expected-status-code 403))))
       (testing "Require valid collection_ids"
         (testing "Non-empty"
           (is (= {:errors {:collection_ids "Non-empty, distinct array of Collection IDs"}}
                  (serialize! :request (dissoc good-request :collection_ids))
                  (serialize! :request (assoc good-request :collection_ids nil))
                  (serialize! :request (assoc good-request :collection_ids [])))))
         (testing "No duplicates"
           (is (= {:errors {:collection_ids "Non-empty, distinct array of Collection IDs"}}
                  (serialize! :request (assoc good-request :collection_ids [collection-id collection-id])))))
         (testing "All Collections must exist"
           (is (= (format "Invalid Collection ID(s). These Collections do not exist: #{%d}" Integer/MAX_VALUE)
                  (serialize! :request (assoc good-request :collection_ids [collection-id Integer/MAX_VALUE])
                              :expected-status-code 404))))
         (testing "Invalid value"
           (is (= {:errors {:collection_ids "Non-empty, distinct array of Collection IDs"}}
                  (serialize! :request (assoc good-request :collection_ids collection-id))
                  (serialize! :request (assoc good-request :collection_ids "My Collection"))))))
       (testing "Validate 'path' parameter"
         (is (= {:errors {:path "Valid directory to serialize results to"}}
                (serialize! :request (dissoc good-request :path))
                (serialize! :request (assoc good-request :path ""))
                (serialize! :request (assoc good-request :path 1000)))))))))
